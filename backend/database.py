from models.bookmark import Bookmark
from models.user import User
from models.institute import Institute
from typing import Annotated
from fastapi import Depends
from sqlalchemy.exc import IntegrityError
from utils import hash_password
from models.workshop import Workshop
from sqlmodel import Session, SQLModel
from sqlalchemy import create_engine
from utils import create_db_connection_string

engine = create_engine(create_db_connection_string())

test_data = {
    # "users": [
    #     User(
    #         username="superuser",
    #         name="superuser",
    #         surname="superuser",
    #         email="superuser@example.com",
    #         password=hash_password("123123123"),
    #     ),
    #     User(
    #         username="admin",
    #         name="admin",
    #         surname="admin",
    #         email="admin@example.com",
    #         password=hash_password("adminadmin"),
    #     ),
    # ],
    # "institutes": [
    #     Institute(
    #         id=0,
    #         email="example@example.com",
    #         name="Test Institute",
    #         password=hash_password("example"),
    #     )
    # ],
    # "workshops": [
    #     Workshop(
    #         latitude=41.111200,
    #         longitude=16.882916,
    #         address="Via Giovanni Amendola, Bari, Italia",
    #         name="Workshop 1",
    #         description="description",
    #         link="example.com",
    #         institue_id=0
    #     ),
    #     Workshop(
    #         latitude=41.110987,
    #         longitude=16.873692,
    #         address="Viale della Repubblica, 29, Bari, Italia",
    #         name="Workshop 2",
    #         description="description",
    #         link="example.com",
    #         institue_id=0
    #     ),
    #     Workshop(
    #         latitude=41.062148,
    #         longitude=17.093285,
    #         address="Lungomare Dalmazia, Mola di Bari, Italia",
    #         name="Workshop 3",
    #         description="description",
    #         link="example.com",
    #         institue_id=0
    #     ),
    # ],
    
}


def seed_db():
    print("lmao")
    create_db_and_tables()
    with Session(engine) as session:
        for key, values in test_data.items():
            for value in values:
                try:
                    session.add(value)
                    session.commit()
                except IntegrityError:
                    session.rollback()


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_db_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db_session)]
