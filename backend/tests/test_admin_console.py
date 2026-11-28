import hashlib
from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from bird_business.app import create_app
from bird_business.config import BusinessSettings

ROOT = "/api/v1/community"
ORIGIN = "https://testserver"


@pytest.fixture
def console(tmp_path):
    settings = BusinessSettings(
        database_path=tmp_path / "review.sqlite",
        api_keys="staff-key",
        allow_anonymous=False,
        mobile_signing_key="a" * 64,
        admin_password_sha256=hashlib.sha256(b"test-review-password").hexdigest(),
    )
    app = create_app(settings)
    with TestClient(app, base_url=ORIGIN) as client:
        yield client, {"Authorization": "Bearer " + app.state.auth.issue("writer")}


def sign_in(client):
    result = client.post(
        "/admin/login",
        headers={"Origin": ORIGIN},
        json={"username": "admin", "password": "test-review-password"},
    )
    assert result.status_code == 200
    cookie = result.headers["set-cookie"].lower()
    assert all(flag in cookie for flag in ("httponly", "secure", "samesite=strict", "path=/admin"))
    return {"Origin": ORIGIN, "X-Review-CSRF": result.json()["csrf"]}


def test_login_controls_and_logout(console):
    client, member = console
    assert client.get("/admin/").status_code == 200
    assert client.get("/admin/assets/console.js").is_success
    assert client.get("/admin/queue", headers=member).status_code == 401
    for path in (
        "overview",
        "users",
        "groups",
        "groups/example/members",
        "groups/example/messages",
        "publications",
    ):
        assert client.get("/admin/data/" + path, headers=member).status_code == 401
    assert client.get("/admin/photos/post_test", headers={"X-API-Key": "staff-key"}).status_code == 401
    headers = sign_in(client)
    assert client.get("/admin/session").json()["csrf"] == headers["X-Review-CSRF"]
    assert client.post("/admin/logout", headers={"Origin": ORIGIN}).status_code == 403
    assert (
        client.post("/admin/logout", headers={**headers, "Origin": "https://elsewhere.test"}).status_code
        == 403
    )
    assert client.post("/admin/logout", headers=headers).is_success
    assert client.get("/admin/queue").status_code == 401
    assert client.get("/admin/data/users").status_code == 401
    for _ in range(8):
        assert (
            client.post(
                "/admin/login", headers={"Origin": ORIGIN}, json={"username": "admin", "password": "wrong"}
            ).status_code
            == 401
        )
    assert (
        client.post(
            "/admin/login", headers={"Origin": ORIGIN}, json={"username": "admin", "password": "wrong"}
        ).status_code
        == 429
    )


def test_observation_review_keeps_channel_feedback_private(console):
    client, member = console
    reference = "/api/v2/observations/by-reference/test-photo"
    species = "avibase-C22FBF8D"
    sighting = client.put(
        reference,
        headers=member,
        json={
            "reference": "test-photo",
            "species": species,
            "point": {"latitude": 40, "longitude": 116, "system": "GCJ-02"},
        },
    ).json()["id"]
    preview = client.post(
        ROOT + "/previews",
        headers=member,
        json={
            "sighting": sighting,
            "channels": ["post", "map"],
        },
    ).json()["id"]
    rows = client.post(ROOT + "/publications", headers=member, json={"preview": preview}).json()["items"]
    headers = sign_in(client)
    queue = "/admin/queue?tab=observation"
    group = client.get(queue).json()["items"][0]
    assert group["id"] == sighting
    assert {row["id"] for row in rows} == {row["id"] for row in group["channels"]}
    channels = {row["channel"]: row["id"] for row in rows}
    rejected = client.post(
        "/admin/actions/pending/" + channels["map"],
        headers=headers,
        json={"status": "rejected", "reason": "请核对位置"},
    )
    assert rejected.is_success and len(client.get(queue).json()["items"][0]["channels"]) == 2
    assert client.post(
        "/admin/actions/pending/" + channels["post"], headers=headers, json={"status": "approved"}
    ).is_success
    assert client.get(queue).json()["items"] == []
    state = client.get(reference, headers=member).json()
    assert state["id"] == sighting
    assert {row["channel"]: (row["status"], row["reason"]) for row in state["channels"]} == {
        "map": ("rejected", "请核对位置"),
        "post": ("approved", ""),
    }
    outsider = {"Authorization": "Bearer " + client.app.state.auth.issue("observer-elsewhere")}
    assert client.get(reference, headers=outsider).json() == {"id": None, "channels": []}
    assert client.get("/api/v1/species/" + species + "/places").json()["recordCount"] == 0
    assert "reason" not in client.get(ROOT + "/publications/" + channels["post"]).json()


def test_directory_scopes_data_and_paginates(console):
    client, _ = console
    with client.app.state.community.transaction() as db:
        db.executemany(
            "INSERT INTO members VALUES(?,?)", [(f"bird-{index}", f"subject-{index}") for index in range(21)]
        )
        db.execute("INSERT INTO profiles VALUES('bird-0','finch','山雀','owl','简介',0,'friends','private')")
        for room in ("north", "south"):
            db.execute("INSERT INTO bird_groups VALUES(?, 'bird-0', ?, '2026-11-01', ?)", (room, room, room))
            db.execute(
                "INSERT INTO group_members VALUES(?, 'bird-0', 'joined','bird-0','2026-11-01','')", (room,)
            )
            db.execute(
                "INSERT INTO group_messages VALUES(?, ?, 'bird-0', ?, '2026-11-01', ?)",
                (room, room, room + "-body", room),
            )
        db.execute("INSERT INTO messages VALUES('private','bird-0','bird-1','private-body','','ref')")
        db.execute(
            "INSERT INTO publications(id,owner,channel,status,display,species,day,created) "
            "VALUES('pub','bird-0','post','approved','{\"title\":\"鸟讯\"}','','','2026-11-01')"
        )
    sign_in(client)
    root = "/admin/data/"
    overview = client.get(root + "overview")
    assert overview.headers["cache-control"] == "no-store"
    totals = {entry["name"]: entry["count"] for entry in overview.json()["tables"]}
    assert totals["messages"] == 1 and totals["group_messages"] == 2 and totals["members"] == 21
    assert "private-body" not in overview.text
    assert client.get(root + "messages").status_code == 404
    assert client.get(root + "tables/messages").status_code == 404
    for entry in overview.json()["tables"]:
        if entry["browse"]:
            listed = client.get(root + "tables/" + entry["name"])
            assert listed.is_success and listed.json()["total"] == entry["count"]
    assert len(client.get(root + "users?page=2").json()["items"]) == 1
    users = client.get(root + "users?q=FINCH")
    assert users.json()["items"][0]["nickname"] == "山雀" and "subject" not in users.text
    assert client.get(root + "users", params={"q": "%'"}).json()["total"] == 0
    groups = client.get(root + "groups?q=north").json()["items"]
    assert len(groups) == 1 and groups[0]["members"] == groups[0]["messages"] == 1
    assert client.get(root + "groups/north/members").json()["items"][0]["handle"] == "finch"
    messages = client.get(root + "groups/north/messages")
    assert messages.json()["items"][0]["body"] == "north-body" and "south-body" not in messages.text
    assert client.get(root + "groups/unknown/messages").status_code == 404
    assert client.get(root + "publications", params={"q": "鸟讯"}).json()["items"][0]["status"] == "approved"


def test_review_publication_reply_photo_and_report(console):
    client, member = console
    buffer = BytesIO()
    Image.new("RGB", (12, 12)).save(buffer, "JPEG")
    media = client.post(
        ROOT + "/media", headers=member, files={"file": ("field.jpg", buffer.getvalue())}
    ).json()["id"]
    preview = client.post(
        ROOT + "/previews",
        headers=member,
        json={
            "title": "林中观察",
            "body": "观察笔记",
            "media": media,
            "share_photo": True,
            "channels": ["post"],
        },
    ).json()["id"]
    record = client.post(ROOT + "/publications", headers=member, json={"preview": preview}).json()["items"][
        0
    ]["id"]
    headers = sign_in(client)

    def action(kind, target, status):
        return client.post(f"/admin/actions/{kind}/{target}", headers=headers, json={"status": status})

    queue = client.get("/admin/queue").json()
    assert queue["items"][0]["id"] == record and queue["items"][0]["photo"]
    assert client.get("/admin/photos/" + record).headers["content-type"] == "image/jpeg"
    assert not client.get(ROOT + "/posts").json()["items"]
    assert action("pending", record, "approved").is_success
    assert action("pending", record, "rejected").status_code == 409
    assert client.get("/admin/photos/" + record).status_code == 404
    assert client.get(ROOT + "/posts").json()["items"][0]["id"] == record
    reply = client.post(
        ROOT + "/publications/" + record + "/replies",
        headers=member,
        json={"reference": "my-reply", "body": "发现一只"},
    ).json()["id"]
    assert client.get("/admin/queue?tab=reply").json()["items"][0]["id"] == reply
    assert action("pending", reply, "rejected").is_success
    for decision in ("approved", "rejected"):
        assert client.post(
            ROOT + "/reports/" + record, headers=member, json={"reason": "复核照片"}
        ).is_success
        assert client.get("/admin/queue?tab=reports").json()["items"][0]["reasons"] == ["复核照片"]
        assert action("report", record, decision).is_success
        assert not client.get("/admin/queue?tab=reports").json()["items"]
    assert not client.get(ROOT + "/posts").json()["items"]
    assert client.get("/admin/queue?tab=history").json()["items"][0]["status"] == "report_removed"
