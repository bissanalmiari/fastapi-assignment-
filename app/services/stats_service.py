from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User


def get_active_count(db: Session) -> int:
    return db.query(func.count(User.id)).filter(User.is_deleted == False).scalar()


def get_average_age(db: Session) -> float:
    avg_age = db.query(func.avg(User.age)).filter(User.is_deleted == False).scalar()
    return round(float(avg_age), 2) if avg_age is not None else 0


def get_top_cities(db: Session, limit: int = 3) -> list[dict]:
    results = (
        db.query(User.city, func.count(User.id).label("count"))
        .filter(User.is_deleted == False)
        .group_by(User.city)
        .order_by(func.count(User.id).desc())
        .limit(limit)
        .all()
    )
    return [{"city": city, "count": count} for city, count in results]