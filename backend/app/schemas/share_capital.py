
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ShareCapitalRateUpdate(BaseModel):
    minimum_paid_per_share: Decimal = Field(ge=0)
    rate_per_kg: Decimal = Field(ge=0)


class ShareCapitalRateResponse(BaseModel):
    id: int
    tier_code: str
    minimum_paid_per_share: Decimal
    rate_per_kg: Decimal
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class SharePaymentItem(BaseModel):
    share_number: int = Field(ge=1)
    amount_paid: Decimal = Field(ge=0)


class MemberShareCapitalUpdate(BaseModel):
    shares: int = Field(ge=0)
    payments: list[SharePaymentItem]


class MemberShareCapitalItem(BaseModel):
    share_number: int
    amount_paid: Decimal

    model_config = ConfigDict(from_attributes=True)


class MemberShareCapitalResponse(BaseModel):
    member_id: int
    shares: int
    payments: list[MemberShareCapitalItem]
    qualifying_minimum_per_share: Decimal
    applicable_rate_per_kg: Decimal

