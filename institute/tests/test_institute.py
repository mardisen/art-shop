import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_db_session
from app.routers.institute import router


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


STAFF = {"X-User-Role": "Staff"}
ARTIST = {"X-User-Role": "Artist"}

INSTITUTE_BODY = {
    "name": "Art Academy",
    "address": "Via Roma 1, Milano",
    "link": "https://example.com",
    "description": "A school for fine arts",
}


def create(client, headers=STAFF, **overrides):
    return client.post("/institute/", json=INSTITUTE_BODY | overrides, headers=headers)


def test_create_institute(client):
    resp = create(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Art Academy"
    assert body["id"] is not None


def test_create_institute_optional_fields(client):
    resp = create(client, link=None, description=None)
    assert resp.status_code == 201
    assert resp.json()["link"] is None
    assert resp.json()["description"] is None


def test_list_and_read_institute(client):
    created = create(client).json()
    assert client.get("/institute/").json() == [created]
    assert client.get(f"/institute/{created['id']}").json() == created
    assert client.get("/institute/999").status_code == 404


def test_update_institute(client):
    created = create(client).json()
    resp = client.put(
        f"/institute/{created['id']}",
        json=INSTITUTE_BODY | {"name": "Renamed"},
        headers=STAFF,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Renamed"
    assert client.get(f"/institute/{created['id']}").json()["name"] == "Renamed"


def test_delete_institute(client):
    created = create(client).json()
    assert client.delete(f"/institute/{created['id']}", headers=STAFF).status_code == 200
    assert client.get(f"/institute/{created['id']}").status_code == 404
    assert client.delete(f"/institute/{created['id']}", headers=STAFF).status_code == 404


def test_update_unknown_institute(client):
    resp = client.put("/institute/999", json=INSTITUTE_BODY, headers=STAFF)
    assert resp.status_code == 404


def test_mutations_require_staff_role(client):
    created = create(client).json()
    assert create(client, headers=ARTIST).status_code == 403
    assert create(client, headers={}).status_code == 403
    assert client.put(
        f"/institute/{created['id']}", json=INSTITUTE_BODY, headers=ARTIST
    ).status_code == 403
    assert client.delete(
        f"/institute/{created['id']}", headers=ARTIST
    ).status_code == 403
    assert client.get(f"/institute/{created['id']}").status_code == 200
    assert client.get("/institute/").status_code == 200
