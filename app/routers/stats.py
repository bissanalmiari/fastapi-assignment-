from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import stats_service

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/count")
def get_user_count(db: Session = Depends(get_db)):
    return {"total_users": stats_service.get_active_count(db)}


@router.get("/average-age")
def get_average_age(db: Session = Depends(get_db)):
    return {"average_age": stats_service.get_average_age(db)}


@router.get("/top-cities")
def get_top_cities(db: Session = Depends(get_db)):
    return {"cities": stats_service.get_top_cities(db)}