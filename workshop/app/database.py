from datetime import datetime
from sqlalchemy.exc import IntegrityError
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel
from sqlalchemy import create_engine
from app.utils import create_db_connection_string
from app.models.workshop import Workshop
from dateutil.relativedelta import relativedelta

engine = create_engine(create_db_connection_string())

current_date = datetime.today()

test_data = {
    "workshops": [
        Workshop(
            latitude=41.111200,
            longitude=16.882916,
            address="Via Giovanni Amendola, Bari, Italia",
            name="Workshop 1",
            description="description",
            link="example.com",
            institute_id=1,
            created_by=2,
            date=current_date + relativedelta(month=1)
        ),
        Workshop(
            latitude=41.110987,
            longitude=16.873692,
            address="Viale della Repubblica, 29, Bari, Italia",
            name="Workshop 2",
            description="description",
            link="example.com",
            institute_id=1,
            created_by=2,
            date=current_date + relativedelta(month=2)
        ),
        Workshop(
            latitude=41.062148,
            longitude=17.093285,
            address="Lungomare Dalmazia, Mola di Bari, Italia",
            name="Workshop 3",
            description="description",
            link="example.com",
            institute_id=0,
            created_by=2,
            date=current_date + relativedelta(month=3)
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


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_db_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db_session)]
