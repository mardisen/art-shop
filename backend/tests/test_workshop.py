from database import get_db_session
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

from models.workshop import Workshop
from routers.workshop import router


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def setup_module():
    SQLModel.metadata.create_all(engine)


def override_get_db_session():
    with Session(engine) as session:
        yield session


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_db_session] = override_get_db_session

client = TestClient(app)


def test_create_workshop():
    payload = {
        "latitude": 41.111200,
        "longitude": 16.882916,
        "address": "Via Amendola, Bari",
        "name": "Test Workshop",
        "description": "desc",
        "link": "example.com",
    }
    resp = client.post("/workshop/", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Test Workshop"
    assert body["id"] is not None
    return body["id"]


def test_get_all_workshops():
    resp = client.get("/workshop/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_workshop_found():
    wid = test_create_workshop()
    resp = client.get(f"/workshop/{wid}")
    assert resp.status_code == 200
    assert resp.json()["id"] == wid


def test_get_workshop_not_found():
    resp = client.get("/workshop/99999")
    assert resp.status_code == 404


def test_delete_workshop():
    wid = test_create_workshop()
    resp = client.delete(f"/workshop/{wid}")
    assert resp.status_code == 200
    assert client.get(f"/workshop/{wid}").status_code == 404


def test_delete_workshop_not_found():
    resp = client.delete("/workshop/99999")
    assert resp.status_code == 404
