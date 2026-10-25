from email.policy import default
from enum import Enum
from urllib.parse import urlparse
from dotenv import load_dotenv
from os import getenv


load_dotenv()

class ServiceMatch:
    auth_match = getenv("AUTH_MATCH")
    bookmark_match = getenv("BOOKMARK_MATCH")
    institute_match = getenv("INSTITUTE_MATCH")
    workshop_match = getenv("WORKSHOP_MATCH")

class ServiceNotFoundException(Exception):
    pass

def get_service_url(requested_url: str):
    base_url = urlparse(requested_url).path.split("/")[1]

    match base_url:
        case ServiceMatch.auth_match:
            return getenv("AUTH_URL")
        case ServiceMatch.bookmark_match:
            return getenv("BOOKMARK_URL")
        case ServiceMatch.institute_match:
            return getenv("INSTITUTE_URL")
        case ServiceMatch.workshop_match:
            return getenv("WORKSHOP_URL")
        case _:
            raise ServiceNotFoundException()
            
