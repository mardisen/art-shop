import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_db_session
from app.routers.bookmark import router
from redis_fastapi import get_async_redis

import fakeredis.aioredis


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

    redis = fakeredis.aioredis.FakeRedis()

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_db_session] = override_get_db_session
    app.dependency_overrides[get_async_redis] = lambda: redis
    with TestClient(app) as test_client:
        yield test_client
    SQLModel.metadata.drop_all(engine)


def save(client, workshop_id=1, user_id=7):
    return client.post(
        "/bookmark/", json={"workshop_id": workshop_id}, headers={"X-User-Id": str(user_id)}
    )


def test_save_bookmark(client):
    resp = save(client, workshop_id=1, user_id=7)
    assert resp.status_code == 201
    assert resp.json() == {"user_id": 7, "workshop_id": 1}


def test_save_requires_gateway_header(client):
    resp = client.post("/bookmark/", json={"workshop_id": 1})
    assert resp.status_code == 400


def test_save_duplicate_bookmark(client):
    save(client, workshop_id=1, user_id=7)
    assert save(client, workshop_id=1, user_id=7).status_code == 409


def test_same_workshop_different_users_allowed(client):
    assert save(client, workshop_id=1, user_id=7).status_code == 201
    assert save(client, workshop_id=1, user_id=8).status_code == 201


def test_remove_bookmark(client):
    save(client, workshop_id=1, user_id=7)
    resp = client.delete("/bookmark/1", headers={"X-User-Id": "7"})
    assert resp.status_code == 200
    assert save(client, workshop_id=1, user_id=7).status_code == 201


def test_remove_unknown_bookmark(client):
    resp = client.delete("/bookmark/999", headers={"X-User-Id": "7"})
    assert resp.status_code == 404


def test_remove_only_own_bookmark(client):
    save(client, workshop_id=1, user_id=7)
    resp = client.delete("/bookmark/1", headers={"X-User-Id": "8"})
    assert resp.status_code == 404
    assert save(client, workshop_id=1, user_id=7).status_code == 409
