from sqlalchemy.exc import IntegrityError
from utils import test_data
from utils import create_db_connection_string
import typer
from sqlalchemy import create_engine
from sqlmodel import Session

app = typer.Typer()

engine = create_engine(create_db_connection_string())


def seed_db():
    print("lmao")
    with Session(engine) as session:
        for key, values in test_data.items():
            for value in values:
                try:
                    session.add(value)
                    session.commit()
                except IntegrityError:
                    session.rollback()


@app.command()
def seed():
    seed_db()
    print("database seeded!")


if __name__ == "__main__":
    app()
