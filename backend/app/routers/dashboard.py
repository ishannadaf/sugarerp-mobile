from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import SugarDistribution, SugarPayment, User


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def get_dashboard_summary(
    summary_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("REPORT_VIEW")
    ),
):
    if summary_date is None:
        summary_date = date.today()

    role_names = {
        role.name
        for role in current_user.roles
    }

    distribution_query = select(
        func.count(SugarDistribution.id),
        func.coalesce(
            func.sum(SugarDistribution.bag_count),
            0,
        ),
        func.coalesce(
            func.sum(SugarDistribution.total_weight_kg),
            0,
        ),
        func.coalesce(
            func.sum(SugarDistribution.total_amount),
            0,
        ),
    ).where(
        SugarDistribution.distribution_date == summary_date,
        SugarDistribution.is_active == True,
    )

    payment_query = select(
        func.coalesce(
            func.sum(SugarPayment.amount),
            0,
        )
    ).where(
        SugarPayment.payment_date == summary_date,
        SugarPayment.is_active == True,
    )

    # Workers see only their own dashboard numbers.
    if (
        "MASTER" not in role_names
        and "SUPERVISOR" not in role_names
    ):
        distribution_query = distribution_query.where(
            SugarDistribution.worker_id
            == current_user.id
        )

        payment_query = payment_query.where(
            SugarPayment.collection_worker_id
            == current_user.id
        )

    distribution_result = db.execute(
        distribution_query
    ).one()

    distribution_count = distribution_result[0]
    bag_count = int(distribution_result[1] or 0)
    total_weight = float(distribution_result[2] or 0)
    total_amount = float(distribution_result[3] or 0)

    collected_amount = float(
        db.scalar(payment_query) or 0
    )

    pending_amount = (
        total_amount - collected_amount
    )

    if pending_amount < 0:
        pending_amount = 0

    return {
        "date": summary_date,
        "distribution_count": distribution_count,
        "bag_count": bag_count,
        "total_weight_kg": total_weight,
        "total_amount": total_amount,
        "collected_amount": collected_amount,
        "pending_amount": pending_amount,
    }