from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import Member, SugarDistribution, User, Village
from app.routers.share_capital import calculate_member_tier
from app.schemas.distribution import (
    SugarDistributionCreate,
    SugarDistributionResponse,
)

DEFAULT_ROUTE_ID = 1

router = APIRouter(
    prefix="/api/v1/distributions",
    tags=["Sugar Distribution"],
)


def validate_distribution_references(
    db: Session,
    data: SugarDistributionCreate,
):
    # Route validation is intentionally omitted.
    # All new/updated distributions use DEFAULT_ROUTE_ID.

    village = db.get(Village, data.village_id)
    if not village or not village.is_active:
        raise HTTPException(
            status_code=404,
            detail="Village not found or inactive",
        )

    member = db.get(Member, data.member_id)
    if not member or not member.is_active:
        raise HTTPException(
            status_code=404,
            detail="Member not found or inactive",
        )

    if member.village_id != village.id:
        raise HTTPException(
            status_code=400,
            detail="Member does not belong to selected village",
        )

    return member


def calculate_distribution_amount(
    db: Session,
    member: Member,
    bag_count: int,
    bag_weight_kg: float,
):
    _, qualifying_minimum, applicable_rate = calculate_member_tier(
        db,
        member.id,
        member.shares,
    )

    rate = Decimal(str(applicable_rate))

    if rate <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "This member does not qualify for a sugar rate. "
                "Update the member's per-share payments in Account Master."
            ),
        )

    total_weight = (
        Decimal(str(bag_count))
        * Decimal(str(bag_weight_kg))
    )
    total_amount = total_weight * rate

    return rate, total_weight, total_amount, qualifying_minimum


def require_master(
    current_user: User = Depends(
        require_permission("DISTRIBUTION_EDIT")
    ),
) -> User:
    role_names = {role.name for role in current_user.roles}

    if "MASTER" not in role_names:
        raise HTTPException(
            status_code=403,
            detail="Only MASTER users can edit distribution records",
        )

    return current_user


def get_financial_year_range(distribution_date: date):
    start_year = (
        distribution_date.year
        if distribution_date.month >= 4
        else distribution_date.year - 1
    )

    start_date = date(start_year, 4, 1)
    end_date = date(start_year + 1, 3, 31)

    return start_date, end_date


def ensure_member_not_already_distributed(
    db: Session,
    member_id: int,
    distribution_date: date,
    exclude_distribution_id: int | None = None,
):
    start_date, end_date = get_financial_year_range(
        distribution_date
    )

    query = select(SugarDistribution).where(
        SugarDistribution.member_id == member_id,
        SugarDistribution.is_active.is_(True),
        SugarDistribution.distribution_date >= start_date,
        SugarDistribution.distribution_date <= end_date,
    )

    if exclude_distribution_id is not None:
        query = query.where(
            SugarDistribution.id != exclude_distribution_id
        )

    existing = db.scalar(query.limit(1))

    if existing:
        raise HTTPException(
            status_code=409,
            detail=(
                "This member has already received sugar during "
                f"financial year {start_date.year}-"
                f"{str(start_date.year + 1)[-2:]}. "
                "Only one distribution is allowed per financial year."
            ),
        )


@router.post("", response_model=SugarDistributionResponse)
def create_distribution(
    data: SugarDistributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("DISTRIBUTION_CREATE")
    ),
):
    member = validate_distribution_references(db, data)
    
    ensure_member_not_already_distributed(
        db,
        member.id,
        data.distribution_date,
    )

    rate, total_weight, total_amount, _ = (
        calculate_distribution_amount(
            db,
            member,
            data.bag_count,
            data.bag_weight_kg,
        )
    )

    distribution = SugarDistribution(
        distribution_date=data.distribution_date,
        route_id=DEFAULT_ROUTE_ID,
        village_id=data.village_id,
        member_id=data.member_id,
        worker_id=current_user.id,
        sugar_rate_id=None,
        bag_count=data.bag_count,
        bag_weight_kg=data.bag_weight_kg,
        rate_per_kg=rate,
        total_weight_kg=total_weight,
        total_amount=total_amount,
        delivery_photo_url=data.delivery_photo_url,
        notes=data.notes,
    )

    try:
        db.add(distribution)
        db.commit()
        db.refresh(distribution)
    except Exception:
        db.rollback()
        raise

    return distribution


@router.get("", response_model=list[SugarDistributionResponse])
def get_distributions(
    distribution_date: date | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    route_id: int | None = None,
    village_id: int | None = None,
    member_id: int | None = None,
    worker_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("DISTRIBUTION_VIEW")
    ),
):
    if from_date and to_date and from_date > to_date:
        raise HTTPException(
            status_code=400,
            detail="from_date cannot be after to_date",
        )

    query = select(SugarDistribution).where(
        SugarDistribution.is_active.is_(True)
    )

    role_names = {role.name for role in current_user.roles}

    role_names = {role.name for role in current_user.roles}

    # Only MASTER can view all workers' distributions.
    # Every other user is restricted to their own records.
    if "MASTER" not in role_names:
        query = query.where(
            SugarDistribution.worker_id == current_user.id
        )
    elif worker_id is not None:
        query = query.where(
            SugarDistribution.worker_id == worker_id
        )

    if distribution_date is not None:
        query = query.where(
            SugarDistribution.distribution_date == distribution_date
        )

    if from_date is not None:
        query = query.where(
            SugarDistribution.distribution_date >= from_date
        )

    if to_date is not None:
        query = query.where(
            SugarDistribution.distribution_date <= to_date
        )

    if route_id is not None:
        query = query.where(
            SugarDistribution.route_id == route_id
        )

    if village_id is not None:
        query = query.where(
            SugarDistribution.village_id == village_id
        )

    if member_id is not None:
        query = query.where(
            SugarDistribution.member_id == member_id
        )

    query = query.order_by(
        SugarDistribution.distribution_date.desc(),
        SugarDistribution.id.desc(),
    )

    return db.scalars(query).all()


@router.put(
    "/{distribution_id}",
    response_model=SugarDistributionResponse,
)
def update_distribution(
    distribution_id: int,
    data: SugarDistributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_master),
):
    distribution = db.get(SugarDistribution, distribution_id)

    if not distribution or not distribution.is_active:
        raise HTTPException(
            status_code=404,
            detail="Distribution record not found",
        )

    member = validate_distribution_references(db, data)

    rate, total_weight, total_amount, _ = (
        calculate_distribution_amount(
            db,
            member,
            data.bag_count,
            data.bag_weight_kg,
        )
    )

    distribution.distribution_date = data.distribution_date
    distribution.route_id = DEFAULT_ROUTE_ID
    distribution.village_id = data.village_id
    distribution.member_id = data.member_id
    distribution.sugar_rate_id = None
    distribution.bag_count = data.bag_count
    distribution.bag_weight_kg = data.bag_weight_kg
    distribution.rate_per_kg = rate
    distribution.total_weight_kg = total_weight
    distribution.total_amount = total_amount
    distribution.delivery_photo_url = data.delivery_photo_url
    distribution.notes = data.notes

    try:
        db.commit()
        db.refresh(distribution)
    except Exception:
        db.rollback()
        raise

    return distribution


@router.delete("/{distribution_id}")
def delete_distribution(
    distribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_master),
):
    distribution = db.get(SugarDistribution, distribution_id)

    if not distribution or not distribution.is_active:
        raise HTTPException(
            status_code=404,
            detail="Distribution record not found",
        )

    distribution.is_active = False
    db.commit()

    return {
        "success": True,
        "message": "Distribution record deactivated successfully",
        "distribution_id": distribution_id,
    }
