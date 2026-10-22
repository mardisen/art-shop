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
