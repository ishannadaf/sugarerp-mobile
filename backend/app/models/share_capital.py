
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MemberShareCapital(Base):
    __tablename__ = "member_share_capital"

    __table_args__ = (
        UniqueConstraint(
            "member_id",
            "share_number",
            name="uq_member_share_capital_member_share",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    member_id: Mapped[int] = mapped_column(
        ForeignKey("members.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    share_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    amount_paid: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class ShareCapitalRate(Base):
    __tablename__ = "share_capital_rates"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    tier_code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
    )

    minimum_paid_per_share: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    rate_per_kg: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
