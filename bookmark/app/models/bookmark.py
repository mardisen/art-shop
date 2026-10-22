from sqlmodel import Field
from sqlmodel import SQLModel


class BookmarkBase(SQLModel):
    workshop_id: int = Field()


class Bookmark(BookmarkBase, table=True):
    user_id: int = Field(primary_key=True)
    workshop_id: int = Field(primary_key=True)
