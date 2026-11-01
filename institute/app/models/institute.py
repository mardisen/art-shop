from sqlmodel import Field
from sqlmodel import SQLModel


class InstituteBase(SQLModel):
    name: str = Field()
    address: str = Field()
    link: str | None = Field(default=None)
    description: str | None = Field(default=None)


class Institute(InstituteBase, table=True):
    id: int | None = Field(primary_key=True, default=None)
