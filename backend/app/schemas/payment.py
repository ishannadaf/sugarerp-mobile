from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class SugarPaymentCreate(BaseModel):
    distribution_id: int
    payment_date: date
    amount: float = Field(gt=0)
    payment_mode: str
    reference_number: str | None = None
    notes: str | None = None


class SugarPaymentResponse(BaseModel):
    id: int
    distribution_id: int
    member_id: int
    collection_worker_id: int
    payment_date: date
    amount: float
    payment_mode: str
    reference_number: str | None
    notes: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)