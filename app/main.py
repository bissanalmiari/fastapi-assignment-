from fastapi import FastAPI
from app.routers import auth, users, stats

app = FastAPI(title="FastAPI Auth & User Management System")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"message": "API is running"}