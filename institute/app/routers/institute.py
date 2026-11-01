from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import select

from app.database import SessionDep
from app.models.institute import Institute
from app.models.institute import InstituteBase


router = APIRouter(prefix="/institute", tags=["institute"])


def require_professor(x_user_role: Annotated[str | None, Header()] = None):
    if x_user_role != "Professor":
        raise HTTPException(status_code=403, detail="Professor only")
    return None


ProfessorDep = Annotated[None, Depends(require_professor)]


def _check_ownership(x_institute_id: str | None, id: int):
    if not x_institute_id or x_institute_id == "None":
        raise HTTPException(status_code=403, detail="Not allowed")
    if int(x_institute_id) != id:
        raise HTTPException(status_code=403, detail="Not allowed")


@router.post("/", status_code=201)
def create_institute(
    institute: InstituteBase, session: SessionDep, _: ProfessorDep
):
    db_institute = Institute.model_validate(institute)
    session.add(db_institute)
    session.commit()
    session.refresh(db_institute)
    return db_institute


@router.get("/{id}")
def get_institute(id: int, session: SessionDep):
    institute = session.get(Institute, id)
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    return institute


@router.get("/")
def get_institutes(session: SessionDep):
    return session.exec(select(Institute)).all()


@router.put("/{id}")
def update_institute(
    id: int,
    institute: InstituteBase,
    session: SessionDep,
    _: ProfessorDep,
    x_institute_id: Annotated[str | None, Header()] = None,
):
    db_institute = session.get(Institute, id)
    if not db_institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    _check_ownership(x_institute_id, id)
    for field in institute.model_dump(exclude_unset=True):
        setattr(db_institute, field, getattr(institute, field))
    session.add(db_institute)
    session.commit()
    session.refresh(db_institute)
    return db_institute


@router.delete("/{id}")
def delete_institute(
    id: int,
    session: SessionDep,
    _: ProfessorDep,
    x_institute_id: Annotated[str | None, Header()] = None,
):
    from sqlmodel import text

    db_institute = session.get(Institute, id)
    if not db_institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    _check_ownership(x_institute_id, id)
    try:
        session.execute(text("DELETE FROM workshop WHERE institute_id = :id"), {"id": id})
    except Exception:
        pass
    session.delete(db_institute)
    session.commit()
    return {"ok": True}
