from sqlmodel import Field
from sqlmodel import SQLModel


class Bookmark(SQLModel, table=True):
    artist_id: int | None = Field(default=None, primary_key=True, foreign_key="artist.id")
    workshop_id: int | None = Field(
        default=None, primary_key=True, foreign_key="workshop.id"
    )
