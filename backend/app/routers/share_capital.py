
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import Member, User
from app.models.share_capital import MemberShareCapital, ShareCapitalRate
from app.schemas.share_capital import (
    MemberShareCapitalResponse,
    MemberShareCapitalUpdate,
    ShareCapitalRateResponse,
    ShareCapitalRateUpdate,
)

router = APIRouter(
    prefix="/api/v1/share-capital",
    tags=["Share Capital"],
)


def calculate_member_tier(db: Session, member_id: int, shares: int):
    payments = db.scalars(
        select(MemberShareCapital)
        .where(MemberShareCapital.member_id == member_id)
        .order_by(MemberShareCapital.share_number)
    ).all()

    rates = db.scalars(
        select(ShareCapitalRate)
        .where(ShareCapitalRate.is_active.is_(True))
        .order_by(ShareCapitalRate.minimum_paid_per_share)
    ).all()

    if shares == 0 or not rates:
        return payments, Decimal("0"), Decimal("0")

    payment_by_share = {
        payment.share_number: Decimal(str(payment.amount_paid))
        for payment in payments
    }

    # A tier qualifies only if every share meets its minimum.
    qualifying_minimum = min(
        (payment_by_share.get(number, Decimal("0"))
         for number in range(1, shares + 1)),
        default=Decimal("0"),
    )

    applicable_rate = Decimal("0")

    for rate in rates:
        if qualifying_minimum >= Decimal(str(rate.minimum_paid_per_share)):
            applicable_rate = Decimal(str(rate.rate_per_kg))

    return payments, qualifying_minimum, applicable_rate


@router.get("/rates", response_model=list[ShareCapitalRateResponse])
def get_share_capital_rates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("RATE_VIEW")),
):
    return db.scalars(
        select(ShareCapitalRate)
        .where(ShareCapitalRate.is_active.is_(True))
        .order_by(ShareCapitalRate.minimum_paid_per_share)
    ).all()


@router.put("/rates/{tier_code}", response_model=ShareCapitalRateResponse)
def update_share_capital_rate(
    tier_code: str,
    data: ShareCapitalRateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("RATE_EDIT")),
):
    rate = db.scalar(
        select(ShareCapitalRate).where(
            ShareCapitalRate.tier_code == tier_code
        )
    )

    if not rate:
        raise HTTPException(status_code=404, detail="Share-capital tier not found")

    rate.minimum_paid_per_share = data.minimum_paid_per_share
    rate.rate_per_kg = data.rate_per_kg

    db.commit()
    db.refresh(rate)
    return rate


@router.get("/members/{member_id}", response_model=MemberShareCapitalResponse)
def get_member_share_capital(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("MEMBER_VIEW")),
):
    member = db.get(Member, member_id)

    if not member or not member.is_active:
        raise HTTPException(status_code=404, detail="Member not found")

    payments, minimum, applicable_rate = calculate_member_tier(
        db, member.id, member.shares
    )

    return {
        "member_id": member.id,
        "shares": member.shares,
        "payments": payments,
        "qualifying_minimum_per_share": minimum,
        "applicable_rate_per_kg": applicable_rate,
    }


@router.put("/members/{member_id}", response_model=MemberShareCapitalResponse)
def update_member_share_capital(
    member_id: int,
    data: MemberShareCapitalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("MEMBER_EDIT")),
):
    member = db.get(Member, member_id)

    if not member or not member.is_active:
        raise HTTPException(status_code=404, detail="Member not found")

    if data.shares != member.shares:
        raise HTTPException(
            status_code=400,
            detail="Share count must match Account Master. Update shares there first.",
        )

    share_numbers = [item.share_number for item in data.payments]

    if len(share_numbers) != len(set(share_numbers)):
        raise HTTPException(status_code=400, detail="Duplicate share numbers supplied")

    if set(share_numbers) != set(range(1, member.shares + 1)):
        raise HTTPException(
            status_code=400,
            detail=f"Provide exactly one payment amount for each of the {member.shares} shares",
        )

    try:
        existing = db.scalars(
            select(MemberShareCapital).where(
                MemberShareCapital.member_id == member.id
            )
        ).all()

        existing_by_number = {
            item.share_number: item for item in existing
        }

        for item in data.payments:
            row = existing_by_number.get(item.share_number)

            if row:
                row.amount_paid = item.amount_paid
            else:
                db.add(
                    MemberShareCapital(
                        member_id=member.id,
                        share_number=item.share_number,
                        amount_paid=item.amount_paid,
                    )
                )

        # Remove obsolete rows only if a member's share count has been
        # changed through the proper Account Master workflow.
        db.commit()

    except Exception:
        db.rollback()
        raise

    payments, minimum, applicable_rate = calculate_member_tier(
        db, member.id, member.shares
    )

    return {
        "member_id": member.id,
        "shares": member.shares,
        "payments": payments,
        "qualifying_minimum_per_share": minimum,
        "applicable_rate_per_kg": applicable_rate,
    }
