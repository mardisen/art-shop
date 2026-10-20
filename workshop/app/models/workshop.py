from sqlmodel import Date
from sqlmodel import Relationship
from pydantic_extra_types.coordinate import Latitude
from pydantic_extra_types.coordinate import Longitude
from sqlmodel import Field
from sqlmodel import SQLModel



class WorkshopBase(SQLModel):
    latitude: Longitude = Field()
    longitude: Latitude = Field()
    date: Date = Field()
    address: str = Field()
    name: str = Field()
    description: str = Field()
    link: str | None = Field(default=None)


class Workshop(WorkshopBase, table=True):
    id: int | None = Field(primary_key=True, default=None)
    
    institue_id : int | None = Field(default=None, index=True)
    created_by : int | None = Field(default=None, index=True)
