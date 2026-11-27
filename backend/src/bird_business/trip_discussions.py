"""Bounded community experience, anchored only to independently public map records."""

import json
from datetime import UTC, timedelta


def nearby_discussions(db, sites, current, owner):
    if not sites:
        return []
    cells = [(site["point"]["latitude"], site["point"]["longitude"]) for site in sites]
    where = " OR ".join("(m.lat=? AND m.lon=?)" for _ in cells)
    rows = db.execute(
        """SELECT f.id,f.owner,f.created,f.display,m.id observation,m.day,m.lat,m.lon,
        m.species,t.name,t.english FROM publications f JOIN publications m ON
        ((f.sighting IS NOT NULL AND f.sighting=m.sighting AND f.owner=m.owner)
         OR json_extract(f.display,'$.sourceRecord')=m.id)
        JOIN taxa t ON t.id=m.species
        WHERE f.channel='post' AND f.status='approved' AND m.channel='map'
        AND m.status='approved' AND t.sensitive=0 AND m.day BETWEEN ? AND ?
        AND f.created BETWEEN ? AND ? AND ("""
        + where
        + """) AND NOT EXISTS(SELECT 1 FROM blocks b WHERE
        (b.owner=? AND b.member IN (f.owner,m.owner)) OR
        (b.member=? AND b.owner IN (f.owner,m.owner)))
        ORDER BY m.day DESC,f.created DESC,f.id,m.id LIMIT 120""",
        (
            (current.date() - timedelta(days=365)).isoformat(),
            current.date().isoformat(),
            (current - timedelta(days=180)).astimezone(UTC).isoformat(),
            current.astimezone(UTC).isoformat(),
            *(value for cell in cells for value in cell),
            owner,
            owner,
        ),
    )
    result, seen = [], set()
    for row in rows:
        if row["id"] in seen:
            continue
        display = json.loads(row["display"])
        body = display.get("body", "")
        if not isinstance(body, str) or not body.strip():
            continue
        seen.add(row["id"])
        result.append(
            {
                "record": row["id"],
                "title": str(display.get("title") or "社区观察讨论")[:100],
                "excerpt": body.strip()[:360],
                "published": row["created"][:10],
                "observation": row["observation"],
                "observed": row["day"],
                "species": row["name"] or row["english"],
                "point": {"latitude": row["lat"], "longitude": row["lon"]},
                "basis": "社区经验；关联公开区域约十公里，不证明园内具体地点或今日仍有目击",
            }
        )
        if len(result) == 6:
            break
    return result
