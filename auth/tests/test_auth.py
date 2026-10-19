import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_db_session
from app.routers.auth import create_access_token, router
from app.models.user import User


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


def register(client, **overrides):
    body = {
        "email": "user@example.com",
        "name": "Alice",
        "surname": "Smith",
        "password": "secret123",
        "role": "Artist",
    }
    body.update(overrides)
    return client.post("/auth/register", json=body)


def test_register_success(client):
    resp = register(client)
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "user@example.com"
    assert body["name"] == "Alice"
    assert body["surname"] == "Smith"
    assert "password" not in body


def test_register_duplicate_email(client):
    register(client)
    resp = register(client, name="Bob")
    assert resp.status_code == 400


def test_register_invalid_role(client):
    resp = register(client, role="Nope")
    assert resp.status_code == 422


def test_register_invalid_email(client):
    resp = register(client, email="not-an-email")
    assert resp.status_code == 422


def test_register_stores_hashed_password(client):
    register(client)
    resp = client.post(
        "/auth/login",
        data={"username": "user@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200


def test_login_success(client):
    register(client)
    resp = client.post(
        "/auth/login",
        data={"username": "user@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_wrong_password(client):
    register(client)
    resp = client.post(
        "/auth/login",
        data={"username": "user@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401


def test_login_unknown_user(client):
    resp = client.post(
        "/auth/login",
        data={"username": "nobody@example.com", "password": "x"},
    )
    assert resp.status_code == 401


def test_me_valid_token(client):
    register(client)
    login = client.post(
        "/auth/login",
        data={"username": "user@example.com", "password": "secret123"},
    )
    token = login.json()["access_token"]
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "user@example.com"
    assert "password" not in resp.json()


def test_me_invalid_token(client):
    resp = client.get("/auth/me", headers={"Authorization": "Bearer garbage"})
    assert resp.status_code == 401


def test_me_no_token(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 401


def test_me_token_for_unknown_user(client):
    token = create_access_token(data={"email": "ghost@example.com"})
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
