from os import getenv
from fastapi import Response
from starlette.status import HTTP_404_NOT_FOUND
from fastapi.responses import JSONResponse
from app.utils import forward_request
from app.utils import ServiceNotFoundException
from fastapi import Request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = []

frontend_url = getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)
else:
    # Fallback to localhost if no frontend URL is provided for local development
    origins.extend([
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:3000",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.api_route("{path_name:path}", methods=["GET", "POST", "DELETE", "PUT", "OPTIONS"])
async def route(request: Request):
    if request.method == "OPTIONS":
        return Response(status_code=200)
    try:
        response = await forward_request(request)
        return Response(status_code=response.status_code, content=response.content)
    except ServiceNotFoundException as rnfe:
        return JSONResponse(status_code=HTTP_404_NOT_FOUND, content={"unauthorized": "No such route"})
