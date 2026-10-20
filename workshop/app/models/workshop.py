from sqlmodel import Enum
from sqlmodel import Column
from pydantic import BaseModel
import datetime

from pydantic_extra_types.coordinate import Latitude
from pydantic_extra_types.coordinate import Longitude
from sqlmodel import Field
from sqlmodel import SQLModel

import enum

class Type(enum.Enum):
    Drawing = "Drawing"
    Painting = "Painting"
    Sculpture = "Sculpture"
    Photography = "Photography"
    Other = "Other"


class WorkshopBase(SQLModel):
    latitude: Latitude = Field()
    longitude: Longitude = Field()
    date: datetime.date = Field()
    address: str = Field()
    name: str = Field()
    description: str = Field()
    link: str | None = Field(default=None)

    type: Type = Field(
        sa_column=Column(Enum(Type), default=Type.Other, nullable=True, index=False)
    )


class Workshop(WorkshopBase, table=True):
    id: int | None = Field(primary_key=True, default=None)

    institute_id: int | None = Field(default=None, index=True)
    created_by: int | None = Field(default=None, index=True)

class WorkshopSearch(BaseModel):
    latitude: Latitude
    longitude: Longitude
    distance: int
    type: Type
