"""Loopback-only Qwen writing checks using the production writing implementation.

No GPU, WeChat AppSecret, shared server credential or production database is needed.
The provider key stays in this Python process. This is never a phone/public gateway.
"""

from __future__ import annotations

import argparse
import base64
import getpass
import json
import os
import secrets
import sys
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from fastapi import Request, Response  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402
from PIL import Image  # noqa: E402

from bird_business import writing  # noqa: E402
from bird_business.community_store import CommunityStore  # noqa: E402
from bird_business.config import BusinessSettings  # noqa: E402
from bird_common.app_factory import build_service_app  # noqa: E402
from bird_common.errors import ServiceError  # noqa: E402
from bird_common.mobile_auth import TTL, MobileAuth  # noqa: E402

ORIGIN = "http://127.0.0.1:18200"


def create_local_app(settings: BusinessSettings):
    if settings.environment != "development":
        raise ValueError("writing-dev requires an isolated development configuration")
    isolated = settings.model_copy(
        update={
            "allow_anonymous": False,
            "api_keys": secrets.token_hex(32),
            "mobile_signing_key": secrets.token_hex(32),
            "cors_origins": "",
        }
    )

    @asynccontextmanager
    async def lifespan(app):
        app.state.settings = isolated
        app.state.auth = MobileAuth(isolated, ("/api/v1/journal",))
        app.state.community = CommunityStore(isolated.database_path, isolated.catalog_path)
        writing.install(app)
        try:
            yield
        finally:
            app.state.community.db.close()

    app = build_service_app(
        settings=isolated,
        router=writing.router,
        lifespan=lifespan,
        title="Local Bird Assistant writing test",
        description="Explicit DevTools-only writing; no community or vision service.",
        version="local-writing-1",
    )

    @app.middleware("http")
    async def loopback_only(request: Request, call_next):
        if (
            not request.client
            or request.client.host != "127.0.0.1"
            or request.headers.get("host") != "127.0.0.1:18200"
            or request.headers.get("origin")
        ):
            return JSONResponse(status_code=403, content={"error": {"code": "LOCAL_ONLY"}})
        return await call_next(request)

    @app.post("/dev/writing/session")
    async def session(request: Request, response: Response):
        if request.headers.get("x-bird-devtools") != "writing":
            raise ServiceError("FORBIDDEN", "explicit DevTools writing test required", 403)
        response.headers["Cache-Control"] = "no-store"
        return {
            "access_token": request.app.state.auth.issue("local-writing-test"),
            "expires_in": TTL,
        }

    @app.get("/readyz")
    async def ready():
        return {"mode": "local-writing-test", "configured": bool(isolated.qwen_api_key.get_secret_value())}

    return app


def provider_check(settings: BusinessSettings, image_path: Path | None = None):
    """One text call, and one selected-image call only when explicitly requested."""
    pictures = []
    if image_path:
        with Image.open(image_path) as image:
            if image.width * image.height > 52_000_000:
                raise ValueError("choose a smaller image")
            image.thumbnail((1024, 1024))
            output = BytesIO()
            image.convert("RGB").save(output, format="JPEG", quality=75)
        pictures.append(
            writing.Picture(
                id="selected-photo",
                label="用户主动选择的测试照片",
                dataUrl="data:image/jpeg;base64," + base64.b64encode(output.getvalue()).decode(),
            )
        )
    for selected in [[], pictures] if pictures else [[]]:
        brief = writing.Brief(
            version=1,
            requestId="local-" + uuid4().hex,
            prompt="请整理为简短的观鸟札记。只描述我提供的内容，不推断鸟名、地点、天气或经历。",
            purpose="照片手帐" if selected else "手帐文字接口测试",
            maxChars=160,
            images=selected,
        )
        result = writing.Suggestion.model_validate(
            writing.generate(settings, brief, [writing.safe_image(p) for p in selected])
        )
        if len(result.body) > brief.maxChars:
            raise ServiceError("INVALID_OUTPUT", "writing suggestion exceeds requested length", 502)
        print(
            json.dumps(
                {
                    "model": settings.qwen_model if selected else settings.qwen_text_model,
                    "validated": True,
                    **result.model_dump(),
                },
                ensure_ascii=False,
            )
        )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", help="Beijing API Host plus /compatible-mode/v1")
    parser.add_argument("--check-provider", action="store_true", help="send one actual text request")
    parser.add_argument("--image", type=Path, help="also send this chosen image; requires --check-provider")
    args = parser.parse_args()
    if args.image and not args.check_provider:
        parser.error("--image requires --check-provider")
    key = os.environ.get("BIRD_BUSINESS_QWEN_API_KEY") or os.environ.get("DASHSCOPE_API_KEY")
    if not key:
        if not sys.stdin.isatty():
            parser.error("set BIRD_BUSINESS_QWEN_API_KEY locally or use an interactive hidden prompt")
        key = getpass.getpass("Qwen API key (hidden; never saved): ").strip()
    if not key:
        parser.error("a Qwen API key is required")
    options = {
        "qwen_api_key": key,
        "qwen_text_model": os.environ.get("BIRD_BUSINESS_QWEN_TEXT_MODEL", "qwen-plus"),
        "qwen_model": os.environ.get("BIRD_BUSINESS_QWEN_MODEL", "qwen3-vl-plus"),
        "database_path": Path(__file__).resolve().parents[1] / "runtime/writing-dev.sqlite3",
    }
    base = args.base_url or os.environ.get("BIRD_BUSINESS_QWEN_BASE_URL")
    if base:
        options["qwen_base_url"] = base.rstrip("/")
    settings = BusinessSettings(_env_file=None, **options)
    try:
        if args.check_provider:
            provider_check(settings, args.image)
            return
        import uvicorn

        print("Local writing test: " + ORIGIN + "; provider requests start only from your explicit action.")
        uvicorn.run(create_local_app(settings), host="127.0.0.1", port=18200, access_log=False)
    except ServiceError as error:
        print("Writing test failed: " + error.code + "; no automatic retry.", file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
