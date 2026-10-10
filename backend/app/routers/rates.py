from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import FinancialYear, SugarRate, User
from app.schemas.master import (
    SugarRateCreate,
    SugarRateResponse,
)


router = APIRouter(
    prefix="/api/v1/rates",
    tags=["Sugar Rates"],
)


# ============================================================
# CREATE RATE
# ============================================================

@router.post(
    "",
    response_model=SugarRateResponse,
)
def create_rate(
    data: SugarRateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("RATE_CREATE")
    ),
):
    financial_year = db.get(
        FinancialYear,
        data.financial_year_id,
    )

    if not financial_year:
        raise HTTPException(
            status_code=404,
            detail="Financial year not found",
        )

    if data.effective_to and data.effective_to < data.effective_from:
        raise HTTPException(
            status_code=400,
            detail="Effective end date cannot be before start date",
        )

    rate = SugarRate(
        financial_year_id=data.financial_year_id,
        rate=data.rate,
        effective_from=data.effective_from,
        effective_to=data.effective_to,
    )

    db.add(rate)
    db.commit()
    db.refresh(rate)

    return rate


# ============================================================
# GET RATES
# ============================================================

@router.get(
    "",
    response_model=list[SugarRateResponse],
)
def get_rates(
    financial_year_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("RATE_VIEW")
    ),
):
    query = select(SugarRate).where(
        SugarRate.is_active == True
    )

    if financial_year_id:
        query = query.where(
            SugarRate.financial_year_id == financial_year_id
        )

    query = query.order_by(
        SugarRate.effective_from.desc()
    )

    return db.scalars(query).all()


@router.put("/{rate_id}", response_model=SugarRateResponse)
def update_rate(
    rate_id: int,
    data: SugarRateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("RATE_EDIT")),
):
    rate = db.get(SugarRate, rate_id)

    if not rate:
        raise HTTPException(
            status_code=404,
            detail="Sugar rate not found",
        )

    financial_year = db.get(FinancialYear, data.financial_year_id)

    if not financial_year:
        raise HTTPException(
            status_code=404,
            detail="Financial year not found",
        )

    if data.effective_to and data.effective_to < data.effective_from:
        raise HTTPException(
            status_code=400,
            detail="Effective end date cannot be before start date",
        )

    rate.financial_year_id = data.financial_year_id
    rate.rate = data.rate
    rate.effective_from = data.effective_from
    rate.effective_to = data.effective_to

    db.commit()
    db.refresh(rate)

    return rate


@router.delete("/{rate_id}")
def delete_rate(
    rate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("RATE_EDIT")),
):
    rate = db.get(SugarRate, rate_id)

    if not rate:
        raise HTTPException(
            status_code=404,
            detail="Sugar rate not found",
        )

    rate.is_active = False

    db.commit()

    return {
        "success": True,
        "message": "Sugar rate deactivated successfully",
        "rate_id": rate_id,
    }