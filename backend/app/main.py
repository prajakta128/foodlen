from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import admin, auth, products, reports, restaurants, users
from .core.config import get_settings
from .core.database import Base, engine

settings = get_settings()

app = FastAPI(
    title="FoodLens API",
    description="Food transparency backend for authentication, roles, restaurants, reports, and future analysis services.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(reports.router)
app.include_router(admin.router)
app.include_router(products.router)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "app": settings.app_name}


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
