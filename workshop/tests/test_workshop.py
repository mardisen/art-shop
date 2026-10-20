import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_db_session
from app.routers.workshop import router


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def override_get_db_session():
        with Session(engine) as session:
            yield session

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db_session] = override_get_db_session
    with TestClient(app) as test_client:
        yield test_client
    SQLModel.metadata.drop_all(engine)


WORKSHOP_BODY = {
    "latitude": 45.4642,
    "longitude": 9.19,
    "date": "2026-05-01",
    "address": "Via Roma 1, Milano",
    "name": "Pottery intro",
    "description": "A beginner pottery workshop",
    "link": None,
}


def create(client, user_id=7, institute_id=None):
    headers = {"X-User-Id": str(user_id)}
    if institute_id is not None:
        headers["X-Institute-Id"] = str(institute_id)
    return client.post("/workshop/", json=WORKSHOP_BODY, headers=headers)


def test_create_sets_created_by_from_gateway_header(client):
    resp = create(client, user_id=7)
    assert resp.status_code == 200
    assert resp.json()["created_by"] == 7
    assert resp.json()["institute_id"] is None


def test_create_sets_institute_from_gateway_header(client):
    resp = create(client, user_id=7, institute_id=3)
    assert resp.status_code == 200
    assert resp.json()["institute_id"] == 3


def test_create_requires_gateway_header(client):
    resp = client.post("/workshop/", json=WORKSHOP_BODY)
    assert resp.status_code == 400


def test_list_and_read_workshop(client):
    created = create(client).json()
    assert client.get("/workshop/").json() == [created]
    assert client.get(f"/workshop/{created['id']}").json() == created
    assert client.get("/workshop/999").status_code == 404


def test_update_requires_ownership(client):
    created = create(client, user_id=1).json()
    forbidden = client.put(
        f"/workshop/{created['id']}", json=WORKSHOP_BODY | {"name": "Hacked"},
        headers={"X-User-Id": "2"},
    )
    assert forbidden.status_code == 403
    ok = client.put(
        f"/workshop/{created['id']}", json=WORKSHOP_BODY | {"name": "Renamed"},
        headers={"X-User-Id": "1"},
    )
    assert ok.status_code == 200
    assert ok.json()["name"] == "Renamed"
    assert ok.json()["created_by"] == 1


def test_update_unknown_workshop(client):
    resp = client.put(
        "/workshop/999", json=WORKSHOP_BODY, headers={"X-User-Id": "1"}
    )
    assert resp.status_code == 404


def test_delete_requires_ownership(client):
    created = create(client, user_id=1).json()
    forbidden = client.delete(f"/workshop/{created['id']}", headers={"X-User-Id": "2"})
    assert forbidden.status_code == 403
    ok = client.delete(f"/workshop/{created['id']}", headers={"X-User-Id": "1"})
    assert ok.status_code == 200
    assert client.get(f"/workshop/{created['id']}").status_code == 404
