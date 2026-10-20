from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import select

from app.database import SessionDep
from app.models.workshop import Workshop
from app.models.workshop import WorkshopBase


router = APIRouter(prefix="/workshop", tags=["workshop"])


def get_caller_id(x_user_id: Annotated[int | None, Header()] = None) -> int:
    if x_user_id is None:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    return x_user_id


CallerDep = Annotated[int, Depends(get_caller_id)]


@router.post("/")
def create_workshop(
    workshop: WorkshopBase,
    session: SessionDep,
    caller_id: CallerDep,
    x_institute_id: Annotated[int | None, Header()] = None,
):
    db_workshop = Workshop.model_validate(workshop)
    db_workshop.created_by = caller_id
    db_workshop.institute_id = x_institute_id
    session.add(db_workshop)
    session.commit()
    session.refresh(db_workshop)
    return db_workshop


@router.get("/{id}")
def get_workshop(id: int, session: SessionDep):
    workshop = session.get(Workshop, id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop


@router.get("/")
def get_workshops(session: SessionDep):
    workshops = session.exec(select(Workshop)).all()
    return workshops


@router.delete("/{id}")
def delete_workshop(id: int, session: SessionDep, caller_id: CallerDep):
    workshop = session.get(Workshop, id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    if workshop.created_by != caller_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(workshop)
    session.commit()
    return {"ok": True}
