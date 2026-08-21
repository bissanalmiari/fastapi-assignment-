import math
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.user import User, UserType
from app.core.security import hash_password


def check_duplicate_email(db: Session, email: str, exclude_id: int | None = None):
    query = db.query(User).filter(func.lower(User.email) == email.lower())
    if exclude_id is not None:
        query = query.filter(User.id != exclude_id)
    if query.first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")


def update_user_fields(user: User, data: dict) -> User:
    data = dict(data)
    if "password" in data and data["password"]:
        user.hashed_password = hash_password(data.pop("password"))
    for field, value in data.items():
        setattr(user, field, value)
    return user


def update_own_profile(db: Session, current_user: User, data: dict) -> User:
    if "email" in data and data["email"]:
        check_duplicate_email(db, data["email"], exclude_id=current_user.id)

    update_user_fields(current_user, data)
    db.commit()
    db.refresh(current_user)
    return current_user


def admin_create_user(db: Session, data: dict, role: UserType) -> User:
    check_duplicate_email(db, data["email"])

    user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone=data["phone"],
        city=data["city"],
        age=data["age"],
        hashed_password=hash_password(data["password"]),
        type=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(
    db: Session,
    page: int,
    limit: int,
    city: str | None = None,
    type: UserType | None = None,
    age: int | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
    email: str | None = None,
) -> dict:
    query = db.query(User).filter(User.is_deleted == False)

    if city:
        query = query.filter(func.lower(User.city) == city.lower())
    if type:
        query = query.filter(User.type == type)
    if age:
        query = query.filter(User.age == age)
    if first_name:
        query = query.filter(func.lower(User.first_name).contains(first_name.lower()))
    if last_name:
        query = query.filter(func.lower(User.last_name).contains(last_name.lower()))
    if email:
        query = query.filter(func.lower(User.email).contains(email.lower()))

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    users = query.offset((page - 1) * limit).limit(limit).all()

    return {"page": page, "limit": limit, "total": total, "total_pages": total_pages, "users": users}


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def admin_update_user(db: Session, user_id: int, data: dict) -> User:
    user = get_user_or_404(db, user_id)

    if "email" in data and data["email"]:
        check_duplicate_email(db, data["email"], exclude_id=user_id)

    update_user_fields(user, data)
    db.commit()
    db.refresh(user)
    return user


def soft_delete_user(db: Session, user_id: int) -> None:
    user = get_user_or_404(db, user_id)
    user.is_deleted = True
    user.deleted_at = datetime.now(timezone.utc)
    db.commit()