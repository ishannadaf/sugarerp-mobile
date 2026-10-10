
from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class SugarDistributionCreate(BaseModel):
    distribution_date: date

    route_id: int
    village_id: int
    member_id: int

    # Optional for backward compatibility with existing clients.
    # New distributions will use the member's Share Capital rate.
    sugar_rate_id: int | None = None

    bag_count: int = Field(gt=0)
    bag_weight_kg: float = Field(default=50, gt=0)

    delivery_photo_url: str | None = None
    notes: str | None = None


class SugarDistributionResponse(BaseModel):
    id: int
    distribution_date: date

    route_id: int
    village_id: int
    member_id: int
    worker_id: int
    member_code: str | None = None

    # Legacy reference; new Share Capital distributions may not have one.
    sugar_rate_id: int | None = None

    bag_count: int
    bag_weight_kg: float
    rate_per_kg: float
    total_weight_kg: float
    total_amount: float

    delivery_photo_url: str | None
    notes: str | None

    is_active: bool

    model_config = ConfigDict(from_attributes=True)
