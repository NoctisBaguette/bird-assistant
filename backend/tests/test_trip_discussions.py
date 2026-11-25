import json
from datetime import UTC, datetime, timedelta

import pytest

from bird_business.community_store import CommunityStore, encode
from bird_business.config import BusinessSettings
from bird_business.trip_discussions import nearby_discussions
from bird_business.trip_evidence import TripEvidence
from bird_business.trip_harness import Answer

CURRENT = datetime(2026, 11, 26, 8, tzinfo=UTC)
POINT = {"latitude": 39.9, "longitude": 116.4}


@pytest.fixture
def community(tmp_path):
    store = CommunityStore(tmp_path / "community.sqlite", BusinessSettings().catalog_path)
    with store.transaction() as db:
        species = db.execute("SELECT id FROM taxa WHERE sensitive=0 LIMIT 1").fetchone()[0]
        sensitive = db.execute("SELECT id FROM taxa WHERE sensitive=1 LIMIT 1").fetchone()[0]
    yield store, species, sensitive
    store.db.close()


def publication(db, species, key, channel, **changes):
    row = {
        "id": key,
        "owner": "author",
        "preview": key,
        "channel": channel,
        "sighting": "observation",
        "status": "approved",
        "display": encode({"title": "安静观察", "body": "沿公共岸线慢慢观察。"}),
        "species": species,
        "lat": POINT["latitude"],
        "lon": POINT["longitude"],
        "day": "2026-11-20",
        "created": (CURRENT - timedelta(days=1)).isoformat(),
        **changes,
    }
    db.execute("INSERT INTO publications VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", tuple(row.values()))


def test_experience_requires_both_an_approved_post_and_an_independently_public_map_anchor(community):
    store, species, _ = community
    with store.transaction() as db:
        publication(db, species, "map", "map")
        publication(db, species, "good", "post")
        publication(db, species, "pending", "post", status="pending")
        publication(db, species, "withdrawn", "post", status="withdrawn")
        publication(db, species, "unlocated", "post", sighting=None)
        publication(db, species, "private-only", "post", sighting="private-sighting")
        rows = nearby_discussions(db, [{"point": POINT}], CURRENT, "viewer")
        assert [row["record"] for row in rows] == ["good"]
        assert rows[0]["observed"] == "2026-11-20" and rows[0]["published"] == "2026-11-25"
        assert rows[0]["point"] == POINT and "十公里" in rows[0]["basis"]
        db.execute("UPDATE publications SET status='withdrawn' WHERE id='map'")
        assert nearby_discussions(db, [{"point": POINT}], CURRENT, "viewer") == []


def test_cited_external_records_deduplicate_and_exclude_blocked_sensitive_distant_or_stale_evidence(
    community,
):
    store, species, sensitive = community
    with store.transaction() as db:
        publication(db, species, "map", "map", owner="gbif", sighting=None)
        publication(
            db,
            species,
            "linked",
            "post",
            sighting=None,
            display=encode({"body": "历史水鸟经验", "sourceRecord": "map"}),
        )
        publication(
            db,
            species,
            "stale",
            "post",
            sighting=None,
            created=(CURRENT - timedelta(days=181)).isoformat(),
            display=encode({"body": "过期", "sourceRecord": "map"}),
        )
        publication(
            db,
            species,
            "future",
            "post",
            sighting=None,
            created=(CURRENT + timedelta(days=1)).isoformat(),
            display=encode({"body": "未来", "sourceRecord": "map"}),
        )
        publication(db, sensitive, "sensitive-map", "map", sighting="sensitive-observation")
        publication(db, sensitive, "sensitive-post", "post", sighting="sensitive-observation")
        rows = nearby_discussions(db, [{"point": POINT}], CURRENT, "viewer")
        assert [row["record"] for row in rows] == ["linked"]
        assert (
            nearby_discussions(db, [{"point": {"latitude": 40.1, "longitude": 116.4}}], CURRENT, "viewer")
            == []
        )
        for first, second in [("viewer", "author"), ("author", "viewer"), ("viewer", "gbif")]:
            db.execute("INSERT INTO blocks VALUES(?,?)", (first, second))
            assert nearby_discussions(db, [{"point": POINT}], CURRENT, "viewer") == []
            db.execute("DELETE FROM blocks")


def test_experience_is_bounded_and_never_returns_private_payloads_or_duplicates(community):
    store, species, _ = community
    with store.transaction() as db:
        publication(db, species, "map", "map")
        publication(db, species, "map-copy", "map")
        for index in range(10):
            publication(
                db,
                species,
                f"post-{index}",
                "post",
                display=encode(
                    {
                        "title": "长" * 110,
                        "body": "经验" * 1000,
                        "privateToken": "never-return-this",
                        "point": {"latitude": 39.913721},
                    }
                ),
            )
        rows = nearby_discussions(db, [{"point": POINT}], CURRENT, "viewer")
        assert len(rows) == len({row["record"] for row in rows}) == 6
        assert all(len(row["excerpt"]) == 360 and len(row["title"]) == 100 for row in rows)
        assert "never-return-this" not in json.dumps(rows) and "39.913721" not in json.dumps(rows)
        assert nearby_discussions(db, [], CURRENT, "viewer") == []


def test_only_cited_experiences_render_and_discussion_references_cannot_become_destinations(community):
    store, species, _ = community
    with store.transaction() as db:
        publication(db, species, "map", "map")
        publication(db, species, "post", "post")
        discussions = nearby_discussions(db, [{"point": POINT}], CURRENT, "viewer")
    site = {
        "point": POINT,
        "name": "北京",
        "km": 2,
        "latest": "2026-11-20",
        "count": 1,
        "richness": 1,
        "birds": [],
        "seasonal": 1,
    }
    evidence = TripEvidence(store, POINT, CURRENT, 2, [site], [], discussions)
    answer = Answer.model_validate(
        {"answer": "社区经验仅供历史参考。", "destinations": ["A1"], "sources": ["F0", "D1"], "stages": []}
    )
    evidence.validate(answer)
    rendered = evidence.render(answer)
    assert rendered["communityCards"][0]["record"] == "post"
    assert next(row for row in rendered["sources"] if row["id"] == "D1")["record"] == "post"
    assert evidence.call("get_community_discussions", '{"area":"A1"}')["items"][0]["observed"] == "2026-11-20"
    assert evidence.call("get_community_discussions", '{"area":"D1"}').get("error")
    assert len(evidence.call("get_community_discussions", '{"area":"A1"}')["items"]) == 1
    uncited = answer.model_copy(update={"sources": ["F0"]})
    assert evidence.render(uncited)["communityCards"] == []
    with pytest.raises(ValueError, match="unknown reference"):
        evidence.validate(answer.model_copy(update={"destinations": ["D1"]}))
