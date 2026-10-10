from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(
        Integer,
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
        ForeignKey("villages.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    address: Mapped[str | None] = mapped_column(
        String(255),
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

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    village = relationship(
        "Village",
        back_populates="members",
    )