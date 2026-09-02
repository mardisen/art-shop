from fastapi import Depends
from typing import Annotated
from sqlmodel import Session
from sqlmodel import SQLModel
from utils import create_db_connection_string
from models.user import *
from models.workshop import *
from sqlalchemy import create_engine
from fastapi import FastAPI

engine = create_engine(create_db_connection_string())


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_db_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db_session)]


app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
