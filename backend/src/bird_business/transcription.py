"""Opt-in speech notes through the existing Mainland Qwen account and session."""

import asyncio
import base64
import binascii
import json
import wave
from io import BytesIO
from typing import Annotated, Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request as HttpRequest
from urllib.request import build_opener

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from bird_business.writing import NoRedirect, quota
from bird_common.auth import Principal, require_principal
from bird_common.errors import ServiceError

router = APIRouter(tags=["speech-notes"])
MAX_WAV = 3 * 1024 * 1024
MAX_BODY = 4 * 1024 * 1024 + 1024


class Recording(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    version: Literal[1]
    requestId: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,128}$")
    wav: str = Field(min_length=1, max_length=4 * 1024 * 1024)


def clean_wav(encoded):
    """Use actual PCM-WAV headers, not a device's claimed rate/duration; discard ancillary metadata."""
    try:
        raw = base64.b64decode(encoded, validate=True)
        if not raw or len(raw) > MAX_WAV:
            raise ValueError()
        with wave.open(BytesIO(raw), "rb") as audio:
            channels, rate, width = audio.getnchannels(), audio.getframerate(), audio.getsampwidth()
            frames = audio.getnframes()
            if (
                audio.getcomptype() != "NONE"
                or width != 2
                or channels not in (1, 2)
                or not 8000 <= rate <= 48000
            ):
                raise ValueError()
            if not rate <= frames <= rate * 30:
                raise ServiceError("AUDIO_DURATION", "speech notes require 1–30 seconds", 422)
            pcm = audio.readframes(frames + 1)
            if len(pcm) != frames * channels * width:
                raise ValueError()
        output = BytesIO()
        with wave.open(output, "wb") as audio:
            audio.setnchannels(channels)
            audio.setsampwidth(width)
            audio.setframerate(rate)
            audio.writeframes(pcm)
        return base64.b64encode(output.getvalue()).decode("ascii")
    except (ValueError, EOFError, wave.Error, binascii.Error):
        raise ServiceError("INVALID_AUDIO", "use an intact PCM WAV recording", 422) from None


def transcribe(settings, wav):
    # Omit language so mixed Chinese/English is handled by the ASR model. No generative rewrite.
    payload = {
        "model": settings.asr_model,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "input_audio", "input_audio": {"data": "data:audio/wav;base64," + wav}}],
            }
        ],
        "stream": False,
        "asr_options": {"enable_itn": False},
    }
    request = HttpRequest(
        settings.qwen_base_url + "/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": "Bearer " + settings.qwen_api_key.get_secret_value(),
            "Content-Type": "application/json",
        },
    )
    try:
        with build_opener(NoRedirect()).open(request, timeout=20) as upstream:
            raw = upstream.read(32769)
        if len(raw) > 32768:
            raise ValueError()
        choice = json.loads(raw)["choices"][0]
        text = choice["message"]["content"]
        if choice.get("finish_reason") not in (None, "stop") or not isinstance(text, str) or len(text) > 2000:
            raise ValueError()
        if not text.strip():
            raise ServiceError("NO_SPEECH", "no readable speech returned", 422)
        return text.strip()
    except HTTPError as error:
        raise ServiceError(
            "RATE_LIMITED" if error.code == 429 else "UPSTREAM_UNAVAILABLE",
            "speech provider unavailable",
            429 if error.code == 429 else 503,
        ) from None
    except (TimeoutError, URLError):
        raise ServiceError("TIMEOUT", "speech provider unavailable", 504) from None
    except (ValueError, KeyError, IndexError, TypeError):
        raise ServiceError("INVALID_OUTPUT", "speech result unavailable", 502) from None


@router.post("/api/v1/journal/transcriptions")
async def transcription(
    request: Request, response: Response, principal: Annotated[Principal, Depends(require_principal)]
):
    settings = request.app.state.settings
    if principal.subject == "anonymous":
        raise ServiceError("AUTH_REQUIRED", "authenticated speech session required", 401)
    if not settings.asr_enabled or not settings.qwen_api_key.get_secret_value():
        raise ServiceError("NOT_CONFIGURED", "speech service is not enabled", 503)
    raw = bytearray()
    async for chunk in request.stream():
        raw.extend(chunk)
        if len(raw) > MAX_BODY:
            raise ServiceError("BODY_TOO_LARGE", "speech request too large", 413)
    try:
        body = Recording.model_validate_json(raw)
    except ValidationError:
        raise ServiceError("INVALID_INPUT", "speech request is invalid", 422) from None
    wav = clean_wav(body.wav)
    slots = request.app.state.writing_slots
    if not slots.acquire(blocking=False):
        raise ServiceError("RATE_LIMITED", "writing service busy", 429)
    try:
        quota(request, principal.subject)
    except Exception:
        slots.release()
        raise

    def work():
        try:
            text = request.app.state.transcription_upstream(settings, wav)
            if not isinstance(text, str) or not text.strip() or len(text) > 2000:
                raise ServiceError("INVALID_OUTPUT", "speech result unavailable", 502)
            return {
                "version": 1,
                "requestId": body.requestId,
                "text": text.strip(),
                "model": settings.asr_model,
            }
        finally:
            slots.release()

    task = asyncio.create_task(asyncio.to_thread(work))
    task.add_done_callback(lambda done: done.exception() if not done.cancelled() else None)
    try:
        result = await asyncio.wait_for(asyncio.shield(task), timeout=22)
    except TimeoutError:
        raise ServiceError("TIMEOUT", "speech request timed out", 504) from None
    response.headers["Cache-Control"] = "no-store"
    return result
