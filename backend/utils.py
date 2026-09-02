from dotenv import load_dotenv
from os import getenv


def create_db_connection_string():
    load_dotenv()
    engine = getenv("DATABASE_ENGINE")
    user = getenv("DATABASE_USER")
    password = getenv("DATABASE_PASSWORD")
    space = getenv("DATABASE_SPACE")
    url = getenv("DATABASE_URL")
    return engine + "://" + user + ":" + password + "@" + url + "/" + space
