import json
from datetime import UTC, datetime, timedelta
from typing import Literal

from pydantic import Field, model_validator

from bird_business.community import ROOT, public
from bird_business.community_models import Input, Key
from bird_common.errors import ServiceError

Tag = Literal["湿地观鸟", "林间漫步", "城市观鸟", "鸟类摄影", "手帐记录", "观鸟新手"]


class Showcase(Input):
    theme: Literal["forest", "lake", "sunset"] = "forest"
    landscape: Literal["woodland", "waterside"] = "woodland"
    focus: int = Field(default=25, ge=0, le=100)
    cover: Key | None = None
    coverPhoto: Key | None = None
    works: list[Key] = Field(default_factory=list, max_length=3)
    tags: list[Tag] = Field(default_factory=list, max_length=3)
    status: Literal["", "正在观鸟", "整理手帐", "等待鉴定"] = ""

    @model_validator(mode="after")
    def unique_selections(self):
        if self.cover and self.coverPhoto:
            raise ValueError("choose one cover source")
        if len(set(self.works)) != len(self.works) or len(set(self.tags)) != len(self.tags):
            raise ValueError("duplicate selection")
        return self


def available_posts(db, owner, layout):
    keys = list(dict.fromkeys([*layout.works, *([layout.cover] if layout.cover else [])]))
    if not keys:
        return {}
    slots = ",".join("?" for _ in keys)
    rows = db.execute(
        f"SELECT * FROM publications WHERE id IN ({slots}) AND owner=? AND channel='post' "
        "AND status='approved' AND json_extract(display,'$.memberId')=?",
        (*keys, owner, owner),
    )
    return {row["id"]: public(row) for row in rows}


def read_showcase(db, owner):
    row = db.execute(
        "SELECT layout,expires,version FROM profile_showcases LEFT JOIN profile_covers USING(member) "
        "WHERE member=?", (owner,),
    ).fetchone()
    layout = Showcase.model_validate_json(row[0]) if row else Showcase()
    if row:
        layout.coverPhoto = row[2]
    if row and row[1] <= datetime.now(UTC).isoformat():
        layout.status = ""
    posts = available_posts(db, owner, layout)
    layout.works = [key for key in layout.works if key in posts]
    if not posts.get(layout.cover, {}).get("image"):
        layout.cover = None
    return {
        "layout": layout.model_dump(),
        "items": [posts[key] for key in layout.works],
        "coverImage": (
            f"{ROOT}/members/{owner}/cover/{layout.coverPhoto}"
            if layout.coverPhoto else posts.get(layout.cover, {}).get("image", "")
        ),
    }


def save_showcase(db, owner, layout):
    if layout.coverPhoto:
        if not db.execute(
            "SELECT 1 FROM profile_covers WHERE member=? AND version=?", (owner, layout.coverPhoto)
        ).fetchone():
            raise ServiceError("SHOWCASE_UNAVAILABLE", "封面已更换，请重新选择照片", 409)
    else:
        db.execute("DELETE FROM profile_covers WHERE member=?", (owner,))
    posts = available_posts(db, owner, layout)
    if any(key not in posts for key in layout.works) or (
        layout.cover and not posts.get(layout.cover, {}).get("image")
    ):
        raise ServiceError("SHOWCASE_UNAVAILABLE", "请选择本人已公开的署名作品，封面需要含照片", 409)
    now = datetime.now(UTC)
    previous = db.execute("SELECT layout,expires FROM profile_showcases WHERE member=?", (owner,)).fetchone()
    expires = (now + timedelta(hours=24)).isoformat()
    if previous and previous[1] > now.isoformat() and json.loads(previous[0]).get("status") == layout.status:
        expires = previous[1]
    db.execute(
        "INSERT INTO profile_showcases VALUES(?,?,?) ON CONFLICT(member) DO UPDATE SET "
        "layout=excluded.layout,expires=excluded.expires",
        (owner, layout.model_dump_json(exclude={"coverPhoto"}), expires),
    )
    return read_showcase(db, owner)
