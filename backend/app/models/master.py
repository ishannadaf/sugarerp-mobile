from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    String,
    Table,
    Column,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ============================================================
# ROUTE <-> WORKER
# ============================================================

route_workers = Table(
    "route_workers",
    Base.metadata,

    Column(
        "route_id",
        ForeignKey("routes.id", ondelete="CASCADE"),
        primary_key=True,
    ),

    Column(
        "user_id",
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# ============================================================
# FINANCIAL YEAR
# ============================================================

class FinancialYear(Base):

    __tablename__ = "financial_years"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_current: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    routes: Mapped[list["Route"]] = relationship(
        back_populates="financial_year",
    )


# ============================================================
# ROUTE
# ============================================================

class Route(Base):

    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    code: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    financial_year_id: Mapped[int] = mapped_column(
        ForeignKey(
            "financial_years.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    financial_year: Mapped["FinancialYear"] = relationship(
        back_populates="routes",
    )

    villages: Mapped[list["Village"]] = relationship(
        back_populates="route",
    )

    workers: Mapped[list["User"]] = relationship(
        secondary=route_workers,
    )

    __table_args__ = (
        UniqueConstraint(
            "code",
            "financial_year_id",
            name="uq_route_code_financial_year",
        ),
    )


# ============================================================
# DISTRICT
# ============================================================

class District(Base):

    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Maharashtra",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    talukas: Mapped[list["Taluka"]] = relationship(
        back_populates="district",
        cascade="all, delete-orphan",
    )


# ============================================================
# TALUKA
# ============================================================

class Taluka(Base):

    __tablename__ = "talukas"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    district_id: Mapped[int] = mapped_column(
        ForeignKey(
            "districts.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    district: Mapped["District"] = relationship(
        back_populates="talukas",
    )

    villages: Mapped[list["Village"]] = relationship(
        back_populates="taluka",
    )


# ============================================================
# VILLAGE
# ============================================================

class Village(Base):

    __tablename__ = "villages"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    # --------------------------------------------------------
    # TALUKA
    # --------------------------------------------------------

    taluka_id: Mapped[int] = mapped_column(
        ForeignKey(
            "talukas.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    # --------------------------------------------------------
    # ROUTE
    # --------------------------------------------------------
    # A village can exist before it is assigned to a route.
    # Therefore route_id is nullable.

    route_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "routes.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    sequence_no: Mapped[int] = mapped_column(
        default=1,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    taluka: Mapped["Taluka"] = relationship(
        back_populates="villages",
    )

    route: Mapped["Route | None"] = relationship(
        back_populates="villages",
    )

    members: Mapped[list["Member"]] = relationship(
        back_populates="village",
    )


# ============================================================
# MEMBER
# ============================================================

class Member(Base):

    __tablename__ = "members"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    member_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    mobile_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    village_id: Mapped[int] = mapped_column(
        ForeignKey(
            "villages.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    
    shares: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    eligibility_kg: Mapped[float] = mapped_column(
        nullable=False,
        default=0,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    village: Mapped["Village"] = relationship(
        back_populates="members",
    )


# ============================================================
# SUGAR RATE MASTER
# ============================================================

class SugarRate(Base):

    __tablename__ = "sugar_rates"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    financial_year_id: Mapped[int] = mapped_column(
        ForeignKey(
            "financial_years.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    rate: Mapped[float] = mapped_column(
        nullable=False,
    )

    effective_from: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    effective_to: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    financial_year: Mapped["FinancialYear"] = relationship()