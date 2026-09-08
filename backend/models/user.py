from pydantic import EmailStr
from pydantic import BaseModel
from sqlmodel import UniqueConstraint
from models.bookmark import Bookmark
from sqlmodel import Relationship
from sqlmodel import Field
from sqlmodel import SQLModel


class UserBase(SQLModel):
    email: str = Field(index=True)
    username: str = Field()
    name: str = Field()


class User(UserBase, table=True):
    id: int | None = Field(primary_key=True, default=None)
    password: str = Field(nullable=False)
    bookmarked_workshops: list["Workshop"] = Relationship(
        back_populates="bookmarked_users", link_model=Bookmark
    )

    __table_args__ = (UniqueConstraint("email", name="email_constraint"),)
    __table_args__ = (UniqueConstraint("username", name="username_constraint"),)


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    name: str
    password: str
