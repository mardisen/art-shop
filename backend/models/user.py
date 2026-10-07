from pydantic import EmailStr
from pydantic import BaseModel
from sqlmodel import UniqueConstraint
from models.bookmark import Bookmark
from sqlmodel import Relationship
from sqlmodel import Field
from sqlmodel import SQLModel


class UserBase(SQLModel):
    email: str = Field(index=True)
    name: str = Field()


class User(UserBase):
    id: int | None = Field(primary_key=True, default=None)
    password: str = Field(nullable=False)


class Artist(User, table=True):
    surname: str = Field()
    bookmarked_workshops: list["Workshop"] = Relationship(
        back_populates="bookmarked_artists", link_model=Bookmark
    )

    __table_args__ = (UniqueConstraint("email", name="artist_email_constraint"),)


class Istitute(User, table=True):
    address: str = Field()
    link: str | None = Field(default=None)
    description: str | None = Field(default=None)

    __table_args__ = (UniqueConstraint("email", name="institute_email_constraint"),)


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
