from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

database_url = make_url(settings.DATABASE_URL)

# Explicitly select MySQL Connector/Python
if database_url.drivername.startswith("mysql"):
    database_url = database_url.set(
        drivername="mysql+mysqlconnector"
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

# Required by your SQLAlchemy models
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
