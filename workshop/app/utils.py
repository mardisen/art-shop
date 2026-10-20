from pydantic_extra_types.coordinate import Longitude
from pydantic_extra_types.coordinate import Latitude
from dotenv import load_dotenv
from os import getenv
from geopy.distance import geodesic


def create_db_connection_string():
    load_dotenv()
    engine = getenv("DATABASE_ENGINE") or ""
    user = getenv("DATABASE_USER") or ""
    password = getenv("DATABASE_PASSWORD") or ""
    space = getenv("DATABASE_SPACE") or ""
    url = getenv("DATABASE_URL") or ""
    return engine + "://" + user + ":" + password + "@" + url + "/" + space


def distance_between_points(
    latitude: Latitude,
    longitude: Longitude,
    latitude_search: Latitude,
    longitude_search: Longitude,
):
    return geodesic((latitude, longitude), (latitude_search, longitude_search)).km
