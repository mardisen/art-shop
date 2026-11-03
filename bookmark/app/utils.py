from fastapi import Request
from dotenv import load_dotenv
from os import getenv


def create_db_connection_string():
    load_dotenv()
    engine = getenv("DATABASE_ENGINE") or ""
    user = getenv("DATABASE_USER") or ""
    password = getenv("DATABASE_PASSWORD") or ""
    space = getenv("DATABASE_SPACE") or ""
    url = getenv("DATABASE_URL") or ""
    return engine + "://" + user + ":" + password + "@" + url + "/" + space


def custom_key_builder(request: Request, eviction_group="", prefix=""):
    user_id = request.headers.get("X-User-Id")
    return f"{prefix}:{{{eviction_group}}}:{user_id}"
