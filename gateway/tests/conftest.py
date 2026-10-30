import httpx2
import pytest


@pytest.fixture
def upstream(monkeypatch):
    calls = []

    def handler(request: httpx2.Request):
        calls.append(request)
        if request.url.path == "/auth/me":
            if request.headers.get("authorization") or request.headers.get("Authorization"):
                return httpx2.Response(
                    200,
                    json={"id": 7, "role": "Professor", "institute_id": 3},
                )
            return httpx2.Response(401, json={"detail": "Not authenticated"})
        if request.url.path == "/auth/login":
            return httpx2.Response(200, json={"access_token": "tok", "token_type": "bearer"})
        return httpx2.Response(200, json={"ok": True}, headers={"content-type": "application/json"})

    transport = httpx2.MockTransport(handler)
    import app.utils as utils

    class PatchedClient(httpx2.AsyncClient):
        def __init__(self, *args, **kwargs):
            kwargs["transport"] = transport
            super().__init__(*args, **kwargs)

    monkeypatch.setattr(utils.httpx2, "AsyncClient", PatchedClient)
    return calls


@pytest.fixture
def client(monkeypatch, upstream):
    monkeypatch.setenv("AUTH_MATCH", "auth")
    monkeypatch.setenv("BOOKMARK_MATCH", "bookmark")
    monkeypatch.setenv("INSTITUTE_MATCH", "institute")
    monkeypatch.setenv("WORKSHOP_MATCH", "workshop")
    monkeypatch.setenv("AUTH_URL", "http://auth.test")
    monkeypatch.setenv("BOOKMARK_URL", "http://bookmark.test")
    monkeypatch.setenv("INSTITUTE_URL", "http://institute.test")
    monkeypatch.setenv("WORKSHOP_URL", "http://workshop.test")
    import importlib
    import app.main as main
    import app.utils as utils
    importlib.reload(utils)
    importlib.reload(main)
    from fastapi.testclient import TestClient
    return TestClient(main.app, raise_server_exceptions=False)
