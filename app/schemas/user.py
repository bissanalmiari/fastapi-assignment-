from datetime import datetime
import re
from typing import List, Optional
from app.models.user import UserType
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str
    age: int
    password: str

    @field_validator("first_name", "last_name", "city")
    @classmethod
    def not_empty(cls, v):
      if not v or not v.strip():
         raise ValueError("Field cannot be empty")
      return v.strip()
    
    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v):
        if not re.match(r"^\+?[0-9]{7,15}$", v):
            raise ValueError("Invalid phone number format")
        return v

    @field_validator("age")
    @classmethod
    def valid_age(cls, v):
        if v <= 0 or v > 120:
            raise ValueError("Age must be between 1 and 120")
        return v

    @field_validator("password")
    @classmethod
    def valid_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v
    
class AdminUserCreate(UserCreate):
    type: UserType


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str
    age: int
    type: UserType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    age: Optional[int] = None
    password: Optional[str] = None

class AdminUserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    age: Optional[int] = None
    password: Optional[str] = None
    type: Optional[UserType] = None

class PaginatedUsers(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    users: List[UserOut]