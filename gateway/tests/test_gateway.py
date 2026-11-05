import httpx2


def test_login_forwards_to_auth(client, upstream):
    r = client.post("/auth/login", data={"username": "u", "password": "p"})
    assert r.status_code == 200
    assert any(c.url.path == "/auth/login" for c in upstream if c.url.path != "/auth/me")


def test_forwards_to_institute(client, upstream):
    r = client.get("/institute/")
    assert r.status_code == 200
    assert any(c.url.path == "/institute/" for c in upstream if c.url.path != "/auth/me")


def test_injects_headers_when_authenticated(client, upstream):
    r = client.get("/workshop/1", headers={"Authorization": "Bearer t"})
    assert r.status_code == 200
    forwarded = [c for c in upstream if c.url.path == "/workshop/1"]
    h = {k.lower(): v for k, v in forwarded[0].headers.items()}
    assert h["x-user-id"] == "7"
    assert h["x-user-role"] == "Professor"
    assert h["x-institute-id"] == "3"


def test_unknown_route_returns_404(client):
    r = client.get("/nope/123")
    assert r.status_code == 404


def test_forwards_post_json_to_bookmark(client, upstream):
    r = client.post("/bookmark/", json={"workshop_id": 1})
    assert r.status_code == 200
    assert any(c.url.path == "/bookmark/" and c.method == "POST" for c in upstream if c.url.path != "/auth/me")


def test_forwards_delete(client, upstream):
    r = client.delete("/institute/5")
    assert r.status_code == 200
    assert any(c.url.path == "/institute/5" and c.method == "DELETE" for c in upstream if c.url.path != "/auth/me")


def test_no_headers_when_no_auth(client, upstream):
    r = client.get("/workshop/")
    assert r.status_code == 200
    forwarded = [c for c in upstream if c.url.path == "/workshop/"]
    h = {k.lower(): v for k, v in forwarded[0].headers.items()}
    assert "x-user-id" not in h


def test_upstream_host_header_not_forwarded(client, upstream):
    client.get("/institute/")
    forwarded = [c for c in upstream if c.url.path == "/institute/"]
    assert forwarded[0].headers["host"] == "institute.test"


def test_query_string_forwarded(client, upstream):
    r = client.get("/institute/?page=2")
    assert r.status_code == 200
    forwarded = [c for c in upstream if c.url.path == "/institute/"]
    assert "page=2" in str(forwarded[0].url)
