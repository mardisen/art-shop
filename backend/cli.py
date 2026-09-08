from database import seed_db
import typer

app = typer.Typer()

@app.command()
def seed():
    seed_db()
    print("database seeded!")


if __name__ == "__main__":
    app()
