from sqlmodel import Field
from sqlmodel import SQLModel
from pydantic_extra_types.coordinate import Coordinate


class Workshop(SQLModel, table=True):
    location: Coordinate = Field()
    address: str = Field()
    name: str = Field()
    description: str = Field()
    link: str | None = Field(default=None)
