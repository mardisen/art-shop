from sqlalchemy.exc import IntegrityError
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel
from sqlalchemy import create_engine, text
from app.utils import create_db_connection_string
from app.models.institute import Institute

engine = create_engine(create_db_connection_string())

test_data = {
    "institutes": [
        Institute(
            id=0,
            address="Via Unità d'Italia",
            name="Test Institute",
            link="example.com",
            description="Lorem Ipsum",
        ),
        Institute(
            id=1,
            address="Via Unità d'Italia",
            name="Test Institute 2",
            link="example.com",
            description="Lorem Ipsum",
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
