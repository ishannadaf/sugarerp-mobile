from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

database_url = settings.DATABASE_URL

# Ensure SQLAlchemy uses PyMySQL instead of MySQLdb
if database_url.startswith("mysql://"):
    database_url = database_url.replace(
        "mysql://", "mysql+pymysql://", 1
    )
elif database_url.startswith("mysql+mysqldb://"):
    database_url = database_url.replace(
        "mysql+mysqldb://", "mysql+pymysql://", 1
    )

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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
