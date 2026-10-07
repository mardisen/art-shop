from models.bookmark import Bookmark
from sqlmodel import Relationship
from pydantic_extra_types.coordinate import Latitude
from pydantic_extra_types.coordinate import Longitude
from sqlmodel import Field
from sqlmodel import SQLModel



class WorkshopBase(SQLModel):
    latitude: Longitude = Field()
    longitude: Latitude = Field()
    address: str = Field()
    name: str = Field()
    description: str = Field()
    link: str | None = Field(default=None)


class Workshop(WorkshopBase, table=True):
    id: int | None = Field(primary_key=True, default=None)

    bookmarked_artists: list["Artist"] = Relationship(
        back_populates="bookmarked_workshops", link_model=Bookmark
    )
