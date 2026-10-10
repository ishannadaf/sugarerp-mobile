from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


database_url = settings.DATABASE_URL

# Use PyMySQL instead of the default MySQLdb driver.
if database_url.startswith("mysql://"):
    database_url = database_url.replace(
        "mysql://",
        "mysql+pymysql://",
        1,
    )
    
print("DATABASE DRIVER CHECK:", database_url.split("://")[0])
print("PYMYSQL IMPORT CHECK:")
import pymysql
print("PyMySQL is installed")

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_recycle=3600,
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()