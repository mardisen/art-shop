from pwdlib import PasswordHash
from models.workshop import Workshop
from models.user import User
from passlib.context import CryptContext
from dotenv import load_dotenv
from os import getenv


pwd_context = PasswordHash.recommended()


def create_db_connection_string():
    load_dotenv()
    engine = getenv("DATABASE_ENGINE") or ""
    user = getenv("DATABASE_USER") or ""
    password = getenv("DATABASE_PASSWORD") or ""
    space = getenv("DATABASE_SPACE") or ""
    url = getenv("DATABASE_URL") or ""
    return engine + "://" + user + ":" + password + "@" + url + "/" + space


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
