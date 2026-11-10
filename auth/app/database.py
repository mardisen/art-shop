from sqlalchemy.exc import IntegrityError
from app.models.user import Role
from app.utils import hash_password
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel
from sqlalchemy import create_engine, text
from app.utils import create_db_connection_string
from app.models.user import User

engine = create_engine(create_db_connection_string())

test_data = {
    "users": [
        User(
            id=1,
            name="artist",
            surname="artist",
            email="artist@example.com",
            password=hash_password("artist"),
            role=Role.Artist,
        ),
        User(
            id=2,
            name="prof",
            surname="prof",
            email="prof@example.com",
            password=hash_password("prof"),
            role=Role.Professor,
            institute_id=1,
        ),
    ],
}


def seed_db():
    create_db_and_tables()
    with Session(engine) as session:
        for key, values in test_data.items():
            for value in values:
                try:
                    session.add(value)
                    session.commit()
                except IntegrityError:
                    session.rollback()
        _reset_sequences(session)


def _reset_sequences(session: Session):
    if engine.dialect.name != "postgresql":
        return
    for values in test_data.values():
        table = values[0].__tablename__
        session.execute(
            text(
                f"SELECT setval(pg_get_serial_sequence('\"{table}\"', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM \"{table}\"), 0) + 1, false)"
            )
        )
    session.commit()


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_db_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db_session)]
