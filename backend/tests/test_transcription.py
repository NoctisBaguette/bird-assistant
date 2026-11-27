import base64
import json
import wave
from io import BytesIO
from urllib.error import HTTPError

import pytest
from fastapi.testclient import TestClient

from bird_business import transcription
from bird_business.app import create_app
from bird_business.config import BusinessSettings
from bird_common.errors import ServiceError

ROUTE = "/api/v1/journal/transcriptions"


def wav(seconds=2, rate=16000, channels=1):
    output = BytesIO()
    with wave.open(output, "wb") as audio:
        audio.setnchannels(channels)
        audio.setsampwidth(2)
        audio.setframerate(rate)
        audio.writeframes(bytes(int(seconds * rate) * channels * 2))
    return output.getvalue()


def body(raw=None, **changes):
    return {"version": 1, "requestId": "speech-1", "wav": base64.b64encode(raw or wav()).decode(), **changes}


@pytest.fixture
def setup(tmp_path):
    settings = BusinessSettings(
        environment="test",
        database_path=tmp_path / "speech.db",
        allow_anonymous=False,
        api_keys="synthetic-server-key",
        mobile_signing_key="b" * 64,
        qwen_api_key="synthetic-provider-key",
        asr_enabled=True,
        qwen_daily_requests=2,
    )
    app = create_app(settings)
    with TestClient(app) as client:
        client.headers["Authorization"] = "Bearer " + app.state.auth.issue("wx:test:speaker")
        calls = []

        def upstream(_settings, audio):
            calls.append(audio)
            return "树麻雀在湖边，ISO eight hundred。"

        app.state.transcription_upstream = upstream
        yield client, app, settings, calls


def test_transcript_preserves_mixed_text_uses_real_wav_header_and_creates_no_publication(setup):
    client, app, _, calls = setup
    raw = wav(rate=44100) + b"PRIVATE-ANCILLARY-DATA"
    result = client.post(ROUTE, json=body(raw))
    assert result.status_code == 200 and result.headers["cache-control"] == "no-store"
    assert result.json()["text"] == "树麻雀在湖边，ISO eight hundred。"
    assert result.json()["requestId"] == "speech-1"
    cleaned = base64.b64decode(calls[0])
    assert b"PRIVATE-ANCILLARY-DATA" not in cleaned
    with wave.open(BytesIO(cleaned), "rb") as audio:
        assert audio.getframerate() == 44100 and audio.getnframes() == 88200
    assert app.state.community.db.execute("SELECT count(*) FROM publications").fetchone()[0] == 0


@pytest.mark.parametrize(
    "changes",
    [
        {"url": "https://example.invalid/private"},
        {"model": "arbitrary"},
        {"wav": "data:audio/wav;base64,AA=="},
        {"wav": "%%%"},
        {"wav": base64.b64encode(b"not a wav").decode()},
        {"version": 2},
    ],
)
def test_invalid_requests_do_not_call_provider_or_use_quota(setup, changes):
    client, app, _, calls = setup
    assert client.post(ROUTE, json=body(**changes)).status_code == 422 and calls == []
    assert (
        app.state.community.db.execute("SELECT 1 FROM sqlite_master WHERE name='writing_usage'").fetchone()
        is None
    )


@pytest.mark.parametrize("seconds", [0.5, 30.1])
def test_authoritative_audio_duration_bounds_precede_model_call(setup, seconds):
    client, _, _, calls = setup
    assert client.post(ROUTE, json=body(wav(seconds))).status_code == 422 and not calls


def test_missing_auth_disabled_feature_body_bound_and_shared_daily_allowance(setup):
    client, app, settings, calls = setup
    authorization = client.headers.pop("Authorization")
    assert client.post(ROUTE, json=body()).status_code == 401
    client.headers["Authorization"] = authorization
    settings.asr_enabled = False
    assert client.post(ROUTE, json=body()).json()["error"]["code"] == "NOT_CONFIGURED"
    settings.asr_enabled = True
    assert client.post(ROUTE, content=b" " * (transcription.MAX_BODY + 1)).status_code == 413
    assert calls == []
    assert client.post(ROUTE, json=body()).status_code == 200
    app.state.writing_upstream = lambda *_: {
        "title": "",
        "body": "保留原意。",
        "design": {"style": "nature", "variant": 1},
    }
    writing = {
        "version": 1,
        "requestId": "write-1",
        "prompt": "整理观察",
        "purpose": "手帐",
        "maxChars": 80,
        "images": [],
    }
    assert client.post("/api/v1/journal/suggestions", json=writing).status_code == 200
    assert client.post(ROUTE, json=body(requestId="speech-2")).status_code == 429 and len(calls) == 1


def test_busy_or_invalid_provider_output_preserves_bounded_slots(setup):
    client, app, _, calls = setup
    slots = app.state.writing_slots
    slots.acquire()
    slots.acquire()
    try:
        assert client.post(ROUTE, json=body()).status_code == 429 and not calls
    finally:
        slots.release()
        slots.release()
    app.state.transcription_upstream = lambda *_: {"not": "text"}
    assert client.post(ROUTE, json=body()).status_code == 502
    assert slots.acquire(blocking=False) and slots.acquire(blocking=False)
    slots.release()
    slots.release()


def test_provider_wire_is_mainland_audio_only_mixed_language_and_never_openai(monkeypatch):
    captured = []

    class Upstream:
        def open(self, request, timeout):
            assert (
                request.full_url
                == "https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions"
            )
            assert timeout == 20
            value = json.loads(request.data)
            captured.append(value)
            assert value["model"] == "qwen3-asr-flash" and value["stream"] is False
            assert value["asr_options"] == {"enable_itn": False}
            assert list(value["messages"][0]["content"][0]) == ["type", "input_audio"]
            return BytesIO(
                json.dumps(
                    {"choices": [{"finish_reason": "stop", "message": {"content": "灰喜鹊和 tree sparrow"}}]}
                ).encode()
            )

    monkeypatch.setattr(transcription, "build_opener", lambda *_: Upstream())
    settings = BusinessSettings(
        qwen_api_key="synthetic-key",
        qwen_base_url="https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
    )
    assert transcription.transcribe(settings, base64.b64encode(wav()).decode()) == "灰喜鹊和 tree sparrow"
    assert len(captured) == 1


@pytest.mark.parametrize("status", [401, 429, 500])
def test_provider_errors_never_expose_debug_body_or_credentials(monkeypatch, status):
    class Upstream:
        def open(self, request, timeout):
            raise HTTPError(request.full_url, status, "synthetic-private-debug", {}, BytesIO(b"private"))

    monkeypatch.setattr(transcription, "build_opener", lambda *_: Upstream())
    with pytest.raises(ServiceError) as failure:
        transcription.transcribe(BusinessSettings(qwen_api_key="synthetic-secret"), "unused")
    assert "private" not in str(failure.value) and "synthetic-secret" not in str(failure.value)


def test_http_timeout_does_not_release_a_slot_while_the_provider_is_still_running(setup, monkeypatch):
    import asyncio
    import threading

    client, app, _, _ = setup
    finished = threading.Event()
    running = threading.Event()
    released = threading.Event()

    def slow_provider(*_):
        running.set()
        assert finished.wait(2)
        released.set()
        return "稍后完成"

    original = asyncio.wait_for

    async def short_wait(task, timeout):
        return await original(task, timeout=0.02)

    app.state.transcription_upstream = slow_provider
    monkeypatch.setattr(transcription.asyncio, "wait_for", short_wait)
    try:
        response = client.post(ROUTE, json=body())
        assert running.is_set() and response.status_code == 504
        slots = app.state.writing_slots
        assert slots.acquire(blocking=False)
        assert not slots.acquire(blocking=False)
        slots.release()
    finally:
        finished.set()
        assert released.wait(1)
