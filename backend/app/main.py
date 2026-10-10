from fastapi import FastAPI
from app.routers.auth import router as auth_router
from app.core.config import settings
from app.routers.users import router as users_router
from app.routers.master import router as master_router
from app.routers.members import router as members_router
from app.routers.rates import router as rates_router
from app.routers.distribution import router as distribution_router
from app.routers.payments import router as payments_router
from app.routers.photos import router as photos_router
from app.routers.dashboard import router as dashboard_router
from app.routers import share_capital

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(master_router)
app.include_router(members_router)
app.include_router(rates_router)
app.include_router(distribution_router)
app.include_router(payments_router)
app.include_router(photos_router)
app.include_router(dashboard_router)
app.include_router(share_capital.router)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Sugar ERP API is running",
        "version": settings.APP_VERSION,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }