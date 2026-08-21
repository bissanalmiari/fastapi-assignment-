from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserType
from app.schemas.user import (
    PaginatedUsers, UserOut, UserUpdate, AdminUserCreate, AdminUserUpdate
)
from app.core.dependencies import get_current_user, require_admin
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = updates.model_dump(exclude_unset=True)
    return user_service.update_own_profile(db, current_user, data)


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    user_in: AdminUserCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    data = user_in.model_dump()
    role = data.pop("type")
    return user_service.admin_create_user(db, data, role)


@router.get("", response_model=PaginatedUsers)
def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    city: Optional[str] = None,
    type: Optional[UserType] = None,
    age: Optional[int] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    email: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return user_service.list_users(
        db, page, limit, city=city, type=type, age=age,
        first_name=first_name, last_name=last_name, email=email,
    )


@router.put("/{user_id}", response_model=UserOut)
def admin_update_user(
    user_id: int,
    updates: AdminUserUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    data = updates.model_dump(exclude_unset=True)
    return user_service.admin_update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user_service.soft_delete_user(db, user_id)
    return None