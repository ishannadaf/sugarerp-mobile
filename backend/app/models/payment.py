from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SugarPayment(Base):
    __tablename__ = "sugar_payments"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    distribution_id: Mapped[int] = mapped_column(
        ForeignKey(
            "sugar_distributions.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    member_id: Mapped[int] = mapped_column(
        ForeignKey(
            "members.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    collection_worker_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    payment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    payment_mode: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    reference_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
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

    distribution = relationship("SugarDistribution")
    member = relationship("Member")
    collection_worker = relationship("User")