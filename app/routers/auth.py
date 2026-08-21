from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.services import auth_service

router = APIRouter(tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, user_in.model_dump())


@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    token = auth_service.authenticate_user(db, credentials.email, credentials.password)
    return {"access_token": token, "token_type": "bearer"}