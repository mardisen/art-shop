from sqlmodel import Relationship
from sqlmodel import Field
from sqlmodel import SQLModel


class Institute(SQLModel, table=True):
    id: int | None = Field(primary_key=True, default=None)
    name: str = Field()
    address: str = Field()
    link: str | None = Field(default=None)
    description: str | None = Field(default=None)

    workhops: list["Workshop"] = Relationship(back_populates="created_by")
