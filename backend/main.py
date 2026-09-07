from sqlmodel import select
from fastapi import HTTPException
from models.workshop import WorkshopBase
from contextlib import asynccontextmanager
from fastapi import Depends
from typing import Annotated
from sqlmodel import Session
from models.user import User
from models.workshop import Workshop
from models.bookmark import Bookmark
from fastapi import FastAPI
from database import create_db_and_tables, get_db_session
from auth import router as auth_router

SessionDep = Annotated[Session, Depends(get_db_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/workshop/")
def create_workshop(workshop: WorkshopBase, session: SessionDep):
    db_workshop = Workshop.model_validate(workshop)
    session.add(db_workshop)
    session.commit()
    session.refresh(db_workshop)
    return db_workshop


@app.get("/workshop/{id}")
def get_workshop(id: int, session: SessionDep):
    workshop = session.get(Workshop, id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop


@app.get("/workshop/")
def get_workshops(session: SessionDep):
    workshops = session.exec(select(Workshop)).all()
    return workshops


@app.delete("/workshop/{id}")
def delete_workshop(id: int, session: SessionDep):
    workshop = session.get(Workshop, id)
    session.delete(workshop)
    session.commit()
    return {"ok": True}