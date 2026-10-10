from datetime import date

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# FINANCIAL YEAR
# ============================================================

class FinancialYearCreate(BaseModel):
    name: str
    start_date: date
    end_date: date


class FinancialYearResponse(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: date
    is_active: bool
    is_current: bool

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# VILLAGE
# ============================================================

class VillageCreate(BaseModel):
    name: str
    taluka_id: int
    route_id: int | None = None
    sequence_no: int = 1


class VillageResponse(BaseModel):
    id: int
    name: str
    taluka_id: int
    route_id: int | None
    sequence_no: int
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )
    
class DistrictResponse(BaseModel):
    id: int
    name: str
    state: str
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )


class TalukaResponse(BaseModel):
    id: int
    name: str
    district_id: int
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )

# ============================================================
# ROUTE
# ============================================================

class RouteCreate(BaseModel):
    code: str
    name: str
    description: str | None = None
    financial_year_id: int


class RouteResponse(BaseModel):
    id: int
    code: str
    name: str
    description: str | None
    financial_year_id: int
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )
    
    
    
# ============================================================
# MEMBER
# ============================================================

class MemberCreate(BaseModel):
    member_code: str
    full_name: str
    mobile_number: str | None = None
    village_id: int
    shares: int = Field(default=0, ge=0)
    eligibility_kg: float = Field(default=0, ge=0)
    address: str | None = None


class MemberResponse(BaseModel):
    id: int
    member_code: str
    full_name: str
    mobile_number: str | None
    village_id: int
    shares: int
    eligibility_kg: float
    address: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
    
    
# ============================================================
# SUGAR RATE
# ============================================================

class SugarRateCreate(BaseModel):
    financial_year_id: int
    rate: float
    effective_from: date
    effective_to: date | None = None


class SugarRateResponse(BaseModel):
    id: int
    financial_year_id: int
    rate: float
    effective_from: date
    effective_to: date | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)