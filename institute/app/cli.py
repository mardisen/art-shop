from app.database import seed_db


def seed():
    seed_db()
    print("database seeded!")


if __name__ == "__main__":
    seed()
