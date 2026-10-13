
FROM python:3.14


WORKDIR /code


COPY ./requirements.txt /code/requirements.txt


RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


COPY . /code/app
COPY .docker.env /code/app/.env


CMD ["fastapi", "run", "app/main.py", "--port", "80"]

HEALTHCHECK --interval=1m00s --timeout=5s --retries=5 CMD curl --include --request GET http://localhost:80/ || exit 1