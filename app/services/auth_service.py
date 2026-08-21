from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.user import User, UserType
from app.core.security import hash_password, verify_password, create_access_token


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(func.lower(User.email) == email.lower()).first()


def register_user(db: Session, data: dict) -> User:
    if get_user_by_email(db, data["email"]):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone=data["phone"],
        city=data["city"],
        age=data["age"],
        hashed_password=hash_password(data["password"]),
        type=UserType.client,  # forced, never taken from input
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> str:
    user = get_user_by_email(db, email)

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if user.is_deleted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account no longer exists")

    return create_access_token(data={"sub": str(user.id)})