from sqlmodel import Column
from sqlmodel import Enum
from pydantic import EmailStr
from pydantic import BaseModel
from sqlmodel import UniqueConstraint
from sqlmodel import Relationship
from sqlmodel import Field
from sqlmodel import SQLModel
import enum


class Role(str, enum.Enum):
    Artist = "Artist"
    Professor = "Professor"


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
    institute_id: int | None = Field(default=None, index=True)

    __table_args__ = (UniqueConstraint("email", name="email_constraint"),)


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    surname: str
    password: str
    role: Role
    institute_id: int | None = None


class UserResponse(BaseModel):
    email: EmailStr
    name: str
    surname: str
    id: int


class UserUpdate(BaseModel):
    name: str | None = None
    surname: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class UserTokenResponse(UserResponse):
    institute_id: int | None
    role: Role