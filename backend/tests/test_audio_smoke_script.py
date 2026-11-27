from __future__ import annotations

import importlib
import json
from argparse import Namespace
from pathlib import Path

import httpx
import pytest


@pytest.fixture
def smoke(monkeypatch):
    monkeypatch.syspath_prepend(str(Path(__file__).resolve().parents[1] / "scripts"))
    return importlib.import_module("smoke_audio_service")


@pytest.mark.parametrize(
    ("ready_status", "sample_status", "sample_body", "exit_code"),
    [
        (200, 200, {"state": "unknown", "candidates": []}, 0),
        (503, 200, {"state": "unknown", "candidates": []}, 1),
        (200, 502, {"error": {"code": "UNAVAILABLE"}}, 1),
        (200, 200, {"error": {"code": "INVALID_SUCCESS"}}, 1),
    ],
)
async def test_authenticated_smoke_reports_failures_without_leaking_session(
    smoke, tmp_path, monkeypatch, capsys, ready_status, sample_status, sample_body, exit_code
):
    manifest = tmp_path / "manifest.json"
    manifest.write_text(
        json.dumps(
            {"samples": [{"sample_id": "clip", "file": "clip.m4a", "container": "m4a", "kind": "bird"}]}
        )
    )
    (tmp_path / "clip.m4a").write_bytes(b"fixture-media")
    session = "test-only-session-not-for-the-evidence"
    monkeypatch.setenv("BIRD_TEST_SESSION", session)
    monkeypatch.setattr(smoke, "make_fixtures", lambda *_: [])
    seen = []

    def handle(request):
        seen.append(request)
        assert request.headers["authorization"] == "Bearer " + session
        if request.url.path == "/readyz":
            return httpx.Response(ready_status, json={"status": "ready"})
        assert request.url.path == "/api/v1/audio/analyses"
        assert b"audio/mp4" in request.content
        assert b'filename="clip.m4a"' in request.content
        assert b"client_reference" in request.content
        return httpx.Response(sample_status, json=sample_body)

    client = httpx.AsyncClient
    monkeypatch.setattr(
        smoke.httpx,
        "AsyncClient",
        lambda **kwargs: client(transport=httpx.MockTransport(handle), **kwargs),
    )
    output = tmp_path / "evidence"
    result = await smoke.run(
        Namespace(
            manifest=str(manifest),
            output=str(output),
            base_url="https://audio.example",
            token_env="BIRD_TEST_SESSION",
        )
    )
    assert result == exit_code
    assert len(seen) == 2
    evidence_text = (output / "integration-evidence.json").read_text()
    evidence = json.loads(evidence_text)
    assert evidence["entry_point"] == "https://audio.example"
    assert "through https://audio.example" in evidence["note"]
    assert session not in evidence_text + capsys.readouterr().out


async def test_missing_smoke_session_fails_before_fixture_generation(smoke, tmp_path, monkeypatch):
    monkeypatch.delenv("BIRD_TEST_MISSING_SESSION", raising=False)
    output = tmp_path / "unused"
    with pytest.raises(SystemExit, match="environment variable is empty"):
        await smoke.run(
            Namespace(
                manifest=str(tmp_path / "absent.json"),
                output=str(output),
                token_env="BIRD_TEST_MISSING_SESSION",
            )
        )
    assert not output.exists()


async def test_empty_manifest_is_not_a_successful_smoke(smoke, tmp_path):
    manifest = tmp_path / "manifest.json"
    manifest.write_text('{"samples": []}')
    with pytest.raises(SystemExit, match="no samples"):
        await smoke.run(Namespace(manifest=str(manifest), output=str(tmp_path / "unused")))
