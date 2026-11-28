import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query, Response

from bird_business.admin_session import authenticated
from bird_business.community import DB
from bird_business.community_store import missing, one

LOGGER = logging.getLogger(__name__)
PAGE_SIZE = 20
Page = Annotated[int, Query(ge=1, le=1000000)]
Search = Annotated[str, Query(max_length=80)]


def private_response(response: Response):
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"


router = APIRouter(prefix="/data", dependencies=[Depends(authenticated), Depends(private_response)])

TABLES = {
    "members": "社区用户",
    "profiles": "用户资料",
    "bird_groups": "群聊",
    "group_members": "群成员与邀请",
    "group_messages": "群消息",
    "messages": "私信",
    "friendships": "好友关系与申请",
    "blocks": "屏蔽关系",
    "chat_reads": "私信已读记录",
    "observations": "识别观察",
    "sightings": "手帐观察",
    "photos": "观察照片",
    "previews": "发布预览",
    "publications": "发布记录",
    "replies": "讨论回复",
    "reactions": "帖子互动",
    "bird_polls": "鉴定投票帖",
    "bird_votes": "鉴定选票",
    "identifications": "鉴定记录",
    "reports": "举报",
    "decisions": "审核记录",
    "review_feedback": "审核反馈",
    "taxa": "鸟种名录",
    "field_photos": "图鉴照片",
    "trip_requests": "出行请求",
    "trip_turns": "出行问答",
    "writing_usage": "写作用量记录",
}


VISIBLE_COLUMNS = {
    "observations": "observation_id,created_at,source,common_name_zh,species_id",
    "sightings": "id,owner,created",
    "photos": "id,owner,created",
    "previews": "id,channels,created",
    "taxa": "id,name,scientific,english,family",
    "field_photos": "species,checked",
    "bird_polls": "post,result,updated",
    "identifications": "id,sighting,reply,species,created",
    "replies": "id,post,status,body,created",
    "decisions": "target,status,reviewer,created",
    "review_feedback": "target,reason",
}


@router.get("/overview")
def overview(database: DB):
    with database.transaction() as db:
        tables = db.execute(
            "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT GLOB 'sqlite_*' ORDER BY name"
        ).fetchall()
        items = []
        for (name,) in tables:
            identifier = '"' + name.replace('"', '""') + '"'
            count = db.execute(f"SELECT count(*) FROM {identifier}").fetchone()[0]
            items.append(
                {
                    "name": name,
                    "label": TABLES.get(name, name),
                    "count": count,
                    "browse": name in VISIBLE_COLUMNS,
                }
            )
        return {"tables": items}


def paginate(db, fields, source, order, params, page):
    total = db.execute("SELECT count(*) " + source, params).fetchone()[0]
    pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
    page = min(page, pages)
    rows = db.execute(
        f"SELECT {fields} {source} ORDER BY {order} LIMIT :limit OFFSET :offset",
        {**params, "limit": PAGE_SIZE, "offset": (page - 1) * PAGE_SIZE},
    )
    return {"items": [dict(row) for row in rows], "total": total, "page": page, "pages": pages}


@router.get("/tables/{table}")
def table_records(table: str, database: DB, page: Page = 1):
    if table not in VISIBLE_COLUMNS:
        raise missing()
    with database.transaction() as db:
        return {
            "label": TABLES[table],
            **paginate(db, VISIBLE_COLUMNS[table], f"FROM {table}", "rowid DESC", {}, page),
        }


@router.get("/users")
def users(database: DB, q: Search = "", page: Page = 1):
    with database.transaction() as db:
        return paginate(
            db,
            "m.id,p.nickname,p.handle,p.bio,p.discoverable,p.dm,p.bookmarks,"
            "(SELECT count(*) FROM group_members WHERE member=m.id AND state='joined') rooms",
            "FROM members m LEFT JOIN profiles p ON p.member=m.id "
            "WHERE :q='' OR instr(m.id,:q)>0 OR instr(p.nickname,:q)>0 "
            "OR instr(lower(p.handle),lower(:q))>0",
            "p.nickname IS NULL,p.nickname,m.id",
            {"q": q.strip()},
            page,
        )


@router.get("/groups")
def groups(database: DB, q: Search = "", page: Page = 1):
    with database.transaction() as db:
        return paginate(
            db,
            "g.id,g.name,g.created,g.owner,p.nickname,"
            "(SELECT count(*) FROM group_members WHERE room=g.id AND state='joined') members,"
            "(SELECT count(*) FROM group_messages WHERE room=g.id) messages",
            "FROM bird_groups g LEFT JOIN profiles p ON p.member=g.owner "
            "WHERE :q='' OR instr(g.name,:q)>0 OR instr(g.id,:q)>0",
            "g.created DESC,g.id",
            {"q": q.strip()},
            page,
        )


@router.get("/groups/{room}/{section}")
def group_details(room: str, section: Literal["members", "messages"], database: DB, page: Page = 1):
    with database.transaction() as db:
        group = one(db, "SELECT id,name,owner FROM bird_groups WHERE id=?", room)
        if section == "members":
            result = paginate(
                db,
                "m.member id,p.nickname,p.handle,m.state,m.joined",
                "FROM group_members m LEFT JOIN profiles p ON p.member=m.member WHERE m.room=:room",
                "m.state DESC,m.joined,m.member",
                {"room": room},
                page,
            )
        else:
            result = paginate(
                db,
                "m.id,m.sender,p.nickname,m.body,m.created",
                "FROM group_messages m LEFT JOIN profiles p ON p.member=m.sender WHERE m.room=:room",
                "m.created DESC,m.id DESC",
                {"room": room},
                page,
            )
            LOGGER.info("Admin read group messages room=%s page=%s", group["id"], result["page"])
        return {**result, "group": dict(group)}


@router.get("/publications")
def publications(database: DB, q: Search = "", page: Page = 1):
    with database.transaction() as db:
        return paginate(
            db,
            "id,channel,status,created,json_extract(display,'$.title') title,"
            "json_extract(display,'$.publicName') author,json_extract(display,'$.speciesName') species",
            "FROM publications WHERE :q='' OR instr(id,:q)>0 OR instr(json_extract(display,'$.title'),:q)>0",
            "created DESC,id",
            {"q": q.strip()},
            page,
        )
