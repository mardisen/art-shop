from database import SessionDep
from sqlmodel import select
from fastapi import HTTPException
from models.workshop import Workshop
from models.workshop import WorkshopBase
from fastapi import APIRouter


router = APIRouter(prefix="/workshop", tags=["workshop"])


@router.post("/")
def create_workshop(workshop: WorkshopBase, session: SessionDep):
    db_workshop = Workshop.model_validate(workshop)
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
def delete_workshop(id: int, session: SessionDep):
    workshop = session.get(Workshop, id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    session.delete(workshop)
    session.commit()
    return {"ok": True}