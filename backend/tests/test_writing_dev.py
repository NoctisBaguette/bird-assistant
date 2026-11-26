import importlib.util
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from bird_business.config import BusinessSettings

spec = importlib.util.spec_from_file_location(
    "writing_dev", Path(__file__).resolve().parents[1] / "scripts/writing_dev.py"
)
dev = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dev)


@pytest.fixture
def local(tmp_path):
    settings = BusinessSettings(
        _env_file=None,
        database_path=tmp_path / "isolated.db",
        qwen_api_key="test-provider-secret",
    )
    app = dev.create_local_app(settings)
    with TestClient(app, base_url=dev.ORIGIN, client=("127.0.0.1", 50000)) as client:
        calls = []

        def upstream(_settings, brief, images):
            calls.append((brief, images))
            return {"title": "观察", "body": "保留这次观察。", "design": {"style": "nature", "variant": 1}}

        app.state.writing_upstream = upstream
        yield client, calls


def test_loopback_handshake_and_production_schema_without_wechat_or_gpu(local):
    client, calls = local
    assert client.get("/readyz").json() == {"mode": "local-writing-test", "configured": True}
    assert client.post("/dev/writing/session").status_code == 403
    response = client.post("/dev/writing/session", headers={"X-Bird-DevTools": "writing"})
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert "test-provider-secret" not in response.text
    body = {
        "version": 1,
        "requestId": "local-check",
        "prompt": "整理我的观察",
        "purpose": "手帐",
        "maxChars": 100,
        "images": [],
    }
    assert client.post("/api/v1/journal/suggestions", json=body).status_code == 401
    client.headers["Authorization"] = "Bearer " + response.json()["access_token"]
    assert client.post("/api/v1/journal/suggestions", json=body).json()["requestId"] == "local-check"
    assert len(calls) == 1
    assert client.post("/api/v1/journal/suggestions", json={**body, "model": "injected"}).status_code == 422
    assert len(calls) == 1
    assert client.get("/api/v1/community/profile").status_code == 404


@pytest.mark.parametrize(
    "headers", [{"Host": "attacker.example:18200"}, {"Origin": "https://attacker.example"}]
)
def test_browser_origin_and_rebound_hosts_cannot_mint_sessions(local, headers):
    client, calls = local
    assert (
        client.post("/dev/writing/session", headers={**headers, "X-Bird-DevTools": "writing"}).status_code
        == 403
    )
    assert not calls


def test_non_loopback_request_is_rejected_before_provider(tmp_path):
    app = dev.create_local_app(BusinessSettings(_env_file=None, database_path=tmp_path / "local.db"))
    with TestClient(app, base_url=dev.ORIGIN, client=("192.0.2.1", 50000)) as client:
        assert client.get("/readyz").status_code == 403


def test_local_developer_app_refuses_a_production_configuration():
    with pytest.raises(ValueError, match="isolated development"):
        dev.create_local_app(
            BusinessSettings(_env_file=None, environment="production", allow_anonymous=False, api_keys="test")
        )
