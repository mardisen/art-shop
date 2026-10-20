import datetime

from pydantic_extra_types.coordinate import Latitude
from pydantic_extra_types.coordinate import Longitude
from sqlmodel import Field
from sqlmodel import SQLModel


class WorkshopBase(SQLModel):
    latitude: Latitude = Field()
    longitude: Longitude = Field()
    date: datetime.date = Field()
    address: str = Field()
    name: str = Field()
    description: str = Field()
    link: str | None = Field(default=None)


class Workshop(WorkshopBase, table=True):
    id: int | None = Field(primary_key=True, default=None)

    institute_id: int | None = Field(default=None, index=True)
    created_by: int | None = Field(default=None, index=True)
