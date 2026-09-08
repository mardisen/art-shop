from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

from database import get_db_session
from models.user import User
from routers.auth import router, create_access_token


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

reg_body = {
    "email": "user@example.com",
    "username": "alice",
    "name": "Alice",
    "password": "secret123",
}


def test_register_success():
    resp = client.post("/auth/register", json=reg_body)
    assert resp.status_code == 201
    body = resp.json()
    assert body["username"] == "alice"
    assert "password" not in body


def test_register_duplicate_username():
    client.post("/auth/register", json=reg_body)
    resp = client.post("/auth/register", json=reg_body)
    assert resp.status_code == 400


def test_register_duplicate_email():
    client.post("/auth/register", json=reg_body)
    dup = {**reg_body, "username": "bob"}
    resp = client.post("/auth/register", json=dup)
    assert resp.status_code == 400


def test_login_success():
    client.post("/auth/register", json=reg_body)
    resp = client.post(
        "/auth/login", data={"username": "alice", "password": "secret123"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_wrong_password():
    client.post("/auth/register", json=reg_body)
    resp = client.post(
        "/auth/login", data={"username": "alice", "password": "wrong"}
    )
    assert resp.status_code == 401


def test_login_unknown_user():
    resp = client.post(
        "/auth/login", data={"username": "nobody", "password": "x"}
    )
    assert resp.status_code == 401


def test_me_valid_token():
    token = create_access_token(data={"sub": "alice"})
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["username"] == "alice"


def test_me_invalid_token():
    resp = client.get("/auth/me", headers={"Authorization": "Bearer garbage"})
    assert resp.status_code == 401


def test_me_no_token():
    resp = client.get("/auth/me")
    assert resp.status_code == 401
