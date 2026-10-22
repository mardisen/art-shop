from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import select

from app.database import SessionDep
from app.models.bookmark import Bookmark
from app.models.bookmark import BookmarkBase


router = APIRouter(prefix="/bookmark", tags=["bookmark"])


def get_caller_id(x_user_id: Annotated[int | None, Header()] = None) -> int:
    if x_user_id is None:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    return x_user_id


CallerDep = Annotated[int, Depends(get_caller_id)]


@router.post("/", status_code=201)
def save_bookmark(bookmark: BookmarkBase, session: SessionDep, caller_id: CallerDep):
    existing = session.get(Bookmark, (caller_id, bookmark.workshop_id))
    if existing:
        raise HTTPException(status_code=409, detail="Bookmark already exists")
    db_bookmark = Bookmark(user_id=caller_id, workshop_id=bookmark.workshop_id)
    session.add(db_bookmark)
    session.commit()
    session.refresh(db_bookmark)
    return db_bookmark


@router.delete("/{workshop_id}")
def remove_bookmark(workshop_id: int, session: SessionDep, caller_id: CallerDep):
    bookmark = session.get(Bookmark, (caller_id, workshop_id))
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    session.delete(bookmark)
    session.commit()
    return {"ok": True}
