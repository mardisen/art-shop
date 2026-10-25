from fastapi.responses import JSONResponse
from app.utils import forward_request
from app.utils import ServiceNotFoundException
from fastapi import Request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
]

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


@app.api_route("{path_name:path}", methods=["GET", "POST", "DELETE", "PUT"])
async def route(request: Request):
    try:
        response = await forward_request(request)
        return JSONResponse(status_code=response.status_code, content=response.json())
    except ServiceNotFoundException as rnfe:
        return {"unauthorized": "No such route"}
