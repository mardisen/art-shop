from json.decoder import JSONDecodeError
from starlette.datastructures import URL
from starlette.datastructures import Headers
import httpx2
from email.policy import default
from enum import Enum
from urllib.parse import urlparse
from dotenv import load_dotenv
from os import getenv
from fastapi import Request


load_dotenv()


class ServiceMatch:
    auth_match = getenv("AUTH_MATCH")
    bookmark_match = getenv("BOOKMARK_MATCH")
    institute_match = getenv("INSTITUTE_MATCH")
    workshop_match = getenv("WORKSHOP_MATCH")


class ServiceUrl:
    auth_url = getenv("AUTH_URL") or "http://localhost:8001"
    bookmark_url = getenv("BOOKMARK_URL") or "http://localhost:8002"
    institute_url = getenv("INSTITUTE_URL") or "http://localhost:8003"
    workshop_url = getenv("WORKSHOP_URL") or "http://localhost:8004"


class ServiceNotFoundException(Exception):
    pass


def get_service_url(requested_url: URL):
    base_url = requested_url.path.split("/")[1]

    match base_url:
        case ServiceMatch.auth_match:
            return ServiceUrl.auth_url
        case ServiceMatch.bookmark_match:
            return ServiceUrl.bookmark_url
        case ServiceMatch.institute_match:
            return ServiceUrl.institute_url
        case ServiceMatch.workshop_match:
            return ServiceUrl.workshop_url
        case _:
            raise ServiceNotFoundException()


async def get_security_headers(headers: Headers):
    async with httpx2.AsyncClient() as client:
        token_headers = {"authorization": headers.get("authorization") or ""}
        response = await client.get(
            ServiceUrl.auth_url + "/auth/me", headers=token_headers
        )

        json = response.json()

        return_headers = headers.mutablecopy()

        print(json)

        try:
            return_headers["X-User-Id"] = str(json["id"])
            return_headers["X-User-Role"] = json["role"]
            return_headers["X-Institute-Id"] = str(json["institute_id"])
        except KeyError:
            pass

        return return_headers


async def forward_request(request: Request):
    url = get_service_url(request.url) + request.url.path
    print(url)

    headers = await get_security_headers(request.headers)
    print(headers)

    try:
        json = await request.json()
    except JSONDecodeError:
        json = None
    form = await request.form()
    async with httpx2.AsyncClient() as client:
        return await client.request(
            request.method,
            url,
            headers=headers,
            json=json,
            data=form,
            params=request.query_params,
        )
