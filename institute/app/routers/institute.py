from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import select

from app.database import SessionDep
from app.models.institute import Institute
from app.models.institute import InstituteBase


router = APIRouter(prefix="/institute", tags=["institute"])


def require_staff(x_user_role: Annotated[str | None, Header()] = None):
    if x_user_role != "Staff":
        raise HTTPException(status_code=403, detail="Staff only")


StaffDep = Annotated[None, Depends(require_staff)]


@router.post("/", status_code=201)
def create_institute(
    institute: InstituteBase, session: SessionDep, _: StaffDep
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
    institutes = session.exec(select(Institute)).all()
    return institutes


@router.put("/{id}")
def update_institute(id: int, institute: InstituteBase, session: SessionDep, _: StaffDep):
    db_institute = session.get(Institute, id)
    if not db_institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    for field in institute.model_dump(exclude_unset=True):
        setattr(db_institute, field, getattr(institute, field))
    session.add(db_institute)
    session.commit()
    session.refresh(db_institute)
    return db_institute


@router.delete("/{id}")
def delete_institute(id: int, session: SessionDep, _: StaffDep):
    institute = session.get(Institute, id)
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    session.delete(institute)
    session.commit()
    return {"ok": True}
