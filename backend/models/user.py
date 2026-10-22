from models.institute import Institute
from sqlmodel import Column
from sqlmodel import Enum
from pydantic import EmailStr
from pydantic import BaseModel
from sqlmodel import UniqueConstraint
from models.bookmark import Bookmark
from sqlmodel import Relationship
from sqlmodel import Field
from sqlmodel import SQLModel
import enum


class Role(enum.Enum):
    Artist = "Artist"
    Staff = "Staff"


class UserBase(SQLModel):
    password: str = Field(nullable=False)
    email: str = Field(index=True)
    name: str = Field()
    surname: str = Field()


class User(UserBase, table=True):
    id: int | None = Field(primary_key=True, default=None)
    role: Role = Field(
        sa_column=Column(Enum(Role), default=Role.Artist, nullable=True, index=False)
    )

    institute_id: int | None = Field(foreign_key="institute.id", default=None)
    institute: Institute | None = Relationship()

    bookmarked_workshops: list["Workshop"] = Relationship(
        back_populates="bookmarked_artists", link_model=Bookmark
    )

    __table_args__ = (UniqueConstraint("email", name="email_constraint"),)


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
