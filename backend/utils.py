from pwdlib import PasswordHash
from models.workshop import Workshop
from models.user import User
from passlib.context import CryptContext
from dotenv import load_dotenv
from os import getenv


pwd_context = PasswordHash.recommended()


def create_db_connection_string():
    load_dotenv()
    engine = getenv("DATABASE_ENGINE")
    user = getenv("DATABASE_USER")
    password = getenv("DATABASE_PASSWORD")
    space = getenv("DATABASE_SPACE")
    url = getenv("DATABASE_URL")
    return engine + "://" + user + ":" + password + "@" + url + "/" + space


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


test_data = {
    "users": [
        User(
            username="superuser",
            name="superuser",
            email="superuser@example.com",
            password=hash_password("123123123"),
        ),
        User(
            username="admin",
            name="admin",
            email="admin@example.com",
            password=hash_password("adminadmin"),
        ),
    ],
    "workshops": [
        Workshop(
            latitude=41.111200,
            longitude=16.882916,
            address="Via Giovanni Amendola, Bari, Italia",
            name="Workshop 1",
            description="description",
            link="example.com",
        ),
        Workshop(
            latitude=41.110987,
            longitude=16.873692,
            address="Viale della Repubblica, 29, Bari, Italia",
            name="Workshop 2",
            description="description",
            link="example.com",
        ),
        Workshop(
            latitude=41.062148,
            longitude=17.093285,
            address="Lungomare Dalmazia, Mola di Bari, Italia",
            name="Workshop 3",
            description="description",
            link="example.com",
        ),
    ],
}
