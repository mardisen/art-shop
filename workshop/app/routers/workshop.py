from pydantic_extra_types.coordinate import Longitude
from pydantic_extra_types.coordinate import Latitude
from app.models.workshop import Type
from redis_fastapi import cache_put
from redis_fastapi import cache
from redis_fastapi import cache_evict
from redis_fastapi import default_key_builder
from app.utils import distance_between_points
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import or_, select

from app.database import SessionDep
from app.models.workshop import Workshop
from app.models.workshop import WorkshopBase
from app.models.workshop import WorkshopSearch


router = APIRouter(prefix="/workshop", tags=["workshop"])


def get_caller_id(x_user_id: Annotated[int | None, Header()] = None) -> int:
    if x_user_id is None:
        raise HTTPException(status_code=400, detail="X-User-Id header required")
    return x_user_id


CallerDep = Annotated[int, Depends(get_caller_id)]


@router.post(
    "/",
    dependencies=[Depends(cache_evict(eviction_group="workshops"))],
)
def create_workshop(
    workshop: WorkshopBase,
    session: SessionDep,
    caller_id: CallerDep,
    x_institute_id: Annotated[int | None, Header()] = None,
):
    db_workshop = Workshop.model_validate(workshop)
    db_workshop.created_by = caller_id
    db_workshop.institute_id = x_institute_id
    session.add(db_workshop)
    session.commit()
    session.refresh(db_workshop)
    return db_workshop


@router.get(
    "/search",
    dependencies=[
        Depends(
            cache(eviction_group="workshops", key_builder=default_key_builder, ttl=300)
        )
    ],
)
def search_workshops(
    session: SessionDep,
    type: Type | None = None,
    search: str | None = None,
    latitude: Latitude | None = None,
    longitude: Longitude | None = None,
    distance: int | None = None,
):
    statement = select(Workshop)

    if type is not None:
        statement = statement.where(Workshop.type == type)

    if search is not None:
        statement = statement.where(
            or_(
                Workshop.name.contains(search),  # pyrefly: ignore[missing-attribute]
                Workshop.description.contains(
                    search
                ),  # pyrefly: ignore[missing-attribute]
            )
        )

    workshops = session.exec(statement).all()

    if latitude is not None and longitude is not None and distance is not None:
        workshops = [
            workshop
            for workshop in workshops
            if distance_between_points(
                workshop.latitude,
                workshop.longitude,
                latitude,
                longitude,
            )
            <= distance
        ]

    return workshops



@router.get(
    "/{id}",
    dependencies=[
        Depends(
            cache(eviction_group="workshops", key_builder=default_key_builder, ttl=300)
        )
    ],
)
def get_workshop(id: int, session: SessionDep):
    workshop = session.get(Workshop, id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return workshop


@router.get(
    "/",
    dependencies=[
        Depends(
            cache(eviction_group="workshops", key_builder=default_key_builder, ttl=300)
        )
    ],
)
def get_workshops(session: SessionDep):
    workshops = session.exec(select(Workshop)).all()
    return workshops


@router.put(
    "/{id}",
    dependencies=[Depends(cache_evict(eviction_group="workshops"))],
)
def update_workshop(
    id: int, workshop: WorkshopBase, session: SessionDep, caller_id: CallerDep
):
    db_workshop = session.get(Workshop, id)
    if not db_workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    if db_workshop.created_by != caller_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    for field in workshop.model_dump(exclude_unset=True):
        setattr(db_workshop, field, getattr(workshop, field))
    session.add(db_workshop)
    session.commit()
    session.refresh(db_workshop)
    return db_workshop


@router.delete(
    "/{id}",
    dependencies=[Depends(cache_evict(eviction_group="workshops"))],
)
def delete_workshop(id: int, session: SessionDep, caller_id: CallerDep):
    workshop = session.get(Workshop, id)
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    if workshop.created_by != caller_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(workshop)
    session.commit()
    return {"ok": True}
