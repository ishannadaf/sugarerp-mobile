
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SugarDistribution(Base):
    __tablename__ = "sugar_distributions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    distribution_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    route_id: Mapped[int] = mapped_column(
        ForeignKey("routes.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    village_id: Mapped[int] = mapped_column(
        ForeignKey("villages.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    member_id: Mapped[int] = mapped_column(
        ForeignKey("members.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    worker_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Legacy rate reference is optional for new distributions.
    # rate_per_kg preserves the rate applied at the time of delivery.
    sugar_rate_id: Mapped[int | None] = mapped_column(
        ForeignKey("sugar_rates.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    bag_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    bag_weight_kg: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=50,
    )

    rate_per_kg: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    total_weight_kg: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    total_amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    delivery_photo_url: Mapped[str | None] = mapped_column(
        String(500),
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

    route = relationship("Route")
    village = relationship("Village")
    member = relationship("Member")
    worker = relationship("User")
    sugar_rate = relationship("SugarRate")
    
    @property
    def member_code(self) -> str | None:
        return self.member.member_code if self.member else None
