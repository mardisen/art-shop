from app.models.user import UserTokenResponse
from app.models.user import UserResponse
from jose import JWTError, jwt
from app.database import SessionDep
from app.models.user import UserCreate
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import select

from app.models.user import Role
from app.models.user import User
from app.utils import hash_password, verify_password

from dotenv import load_dotenv
from os import getenv

load_dotenv()

SECRET_KEY = getenv("SECRET_KEY") or ""
ALGORITHM = getenv("ALGORITHM") or ""
ACCESS_TOKEN_EXPIRE_MINUTES = int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 0)

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class Token(BaseModel):
    access_token: str
    token_type: str


class InstituteChoice(BaseModel):
    institute_id: int | None = None


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, session: SessionDep):
    existing = session.exec(select(User).where((User.email == user_data.email))).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_data.email,
        name=user_data.name,
        surname=user_data.surname,
        role=user_data.role,
        password=hash_password(user_data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={
            "email": user.email,
            "institute": user.institute_id,
            "id": user.id,
            "role": user.role.value if user.role else None,
        }
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserTokenResponse, response_model_exclude_none=True)
def get_me(current_user: Annotated[UserTokenResponse, Depends(get_current_user)]):
    return current_user


@router.put("/institute", response_model=Token)
def choose_institute(
    choice: InstituteChoice,
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.role != Role.Staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Staff only"
        )
    current_user.institute_id = choice.institute_id
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    access_token = create_access_token(
        data={
            "email": current_user.email,
            "institute": current_user.institute_id,
            "id": current_user.id,
            "role": current_user.role.value if current_user.role else None,
        }
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/users/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    session: SessionDep,
    _: Annotated[User, Depends(get_current_user)],
):
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
