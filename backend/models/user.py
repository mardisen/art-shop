from models.workshop import Workshop
from sqlmodel import Field
from sqlmodel import SQLModel


class UserBase(SQLModel):
    email: str = Field(primary_key=True)
    username: str = Field()
    name: str = Field()


class User(UserBase, table=True):
    password: str = Field(nullable=False)
    bookmarked_workshops: list[Workshop] = []
