from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import (
    SugarDistribution,
    SugarPayment,
    User,
)
from app.schemas.payment import (
    SugarPaymentCreate,
    SugarPaymentResponse,
)

router = APIRouter(
    prefix="/api/v1/payments",
    tags=["Sugar Payments"],
)

def require_master(
    current_user: User = Depends(
        require_permission("PAYMENT_EDIT")
    ),
) -> User:
    role_names = {
        role.name
        for role in current_user.roles
    }

    if "MASTER" not in role_names:
        raise HTTPException(
            status_code=403,
            detail="Only MASTER users can edit payment records",
        )

    return current_user


@router.post(
    "",
    response_model=SugarPaymentResponse,
)
def create_payment(
    data: SugarPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("PAYMENT_CREATE")
    ),
):
    distribution = db.get(
        SugarDistribution,
        data.distribution_id,
    )

    if not distribution or not distribution.is_active:
        raise HTTPException(
            status_code=404,
            detail="Distribution record not found",
        )

    existing_paid = db.scalar(
        select(
            func.coalesce(
                func.sum(SugarPayment.amount),
                0,
            )
        ).where(
            SugarPayment.distribution_id == distribution.id,
            SugarPayment.is_active == True,
        )
    )

    remaining_amount = (
        float(distribution.total_amount)
        - float(existing_paid or 0)
    )

    if data.amount > remaining_amount:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment amount exceeds pending amount. "
                f"Pending amount: {remaining_amount:.2f}"
            ),
        )

    payment = SugarPayment(
        distribution_id=distribution.id,
        member_id=distribution.member_id,
        collection_worker_id=current_user.id,
        payment_date=data.payment_date,
        amount=data.amount,
        payment_mode=data.payment_mode,
        reference_number=data.reference_number,
        notes=data.notes,
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment


@router.get(
    "",
    response_model=list[SugarPaymentResponse],
)
def get_payments(
    payment_date: date | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    distribution_id: int | None = None,
    member_id: int | None = None,
    worker_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("PAYMENT_VIEW")
    ),
):
    if from_date and to_date and from_date > to_date:
        raise HTTPException(
            status_code=400,
            detail="from_date cannot be after to_date",
        )

    query = select(SugarPayment).where(
        SugarPayment.is_active == True
    )

    role_names = {
        role.name
        for role in current_user.roles
    }

    # Workers see only payments collected by themselves.
    # Master/Supervisor can view all payments.
    if (
        "MASTER" not in role_names
        and "SUPERVISOR" not in role_names
    ):
        query = query.where(
            SugarPayment.collection_worker_id
            == current_user.id
        )
    elif worker_id is not None:
        query = query.where(
            SugarPayment.collection_worker_id
            == worker_id
        )

    if payment_date is not None:
        query = query.where(
            SugarPayment.payment_date == payment_date
        )

    if from_date is not None:
        query = query.where(
            SugarPayment.payment_date >= from_date
        )

    if to_date is not None:
        query = query.where(
            SugarPayment.payment_date <= to_date
        )

    if distribution_id is not None:
        query = query.where(
            SugarPayment.distribution_id
            == distribution_id
        )

    if member_id is not None:
        query = query.where(
            SugarPayment.member_id == member_id
        )

    query = query.order_by(
        SugarPayment.payment_date.desc(),
        SugarPayment.id.desc(),
    )

    return db.scalars(query).all()

@router.get("/summary")
def get_payment_summary(
    distribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("PAYMENT_VIEW")
    ),
):
    distribution = db.get(
        SugarDistribution,
        distribution_id,
    )

    if not distribution:
        raise HTTPException(
            status_code=404,
            detail="Distribution record not found",
        )

    role_names = {
        role.name
        for role in current_user.roles
    }

    if (
        "MASTER" not in role_names
        and "SUPERVISOR" not in role_names
    ):
        if distribution.worker_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You cannot view this distribution",
            )

    total_paid = db.scalar(
        select(
            func.coalesce(
                func.sum(SugarPayment.amount),
                0,
            )
        ).where(
            SugarPayment.distribution_id
            == distribution_id,
            SugarPayment.is_active == True,
        )
    )

    total_amount = float(
        distribution.total_amount
    )

    paid_amount = float(
        total_paid or 0
    )

    pending_amount = total_amount - paid_amount

    if pending_amount < 0:
        pending_amount = 0

    if paid_amount == 0:
        payment_status = "PENDING"
    elif paid_amount < total_amount:
        payment_status = "PARTIAL"
    else:
        payment_status = "PAID"

    return {
        "distribution_id": distribution.id,
        "total_amount": total_amount,
        "paid_amount": paid_amount,
        "pending_amount": pending_amount,
        "payment_status": payment_status,
    }
    
    
@router.put(
    "/{payment_id}",
    response_model=SugarPaymentResponse,
)
def update_payment(
    payment_id: int,
    data: SugarPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_master),
):
    payment = db.get(
        SugarPayment,
        payment_id,
    )

    if not payment or not payment.is_active:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found",
        )

    distribution = db.get(
        SugarDistribution,
        payment.distribution_id,
    )

    if not distribution or not distribution.is_active:
        raise HTTPException(
            status_code=404,
            detail="Distribution record not found",
        )

    # Calculate all other active payments,
    # excluding the payment currently being edited.
    other_paid = db.scalar(
        select(
            func.coalesce(
                func.sum(SugarPayment.amount),
                0,
            )
        ).where(
            SugarPayment.distribution_id
            == distribution.id,
            SugarPayment.id != payment.id,
            SugarPayment.is_active == True,
        )
    )

    remaining_for_this_payment = (
        float(distribution.total_amount)
        - float(other_paid or 0)
    )

    if data.amount > remaining_for_this_payment:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment amount exceeds available amount. "
                f"Maximum allowed: "
                f"{remaining_for_this_payment:.2f}"
            ),
        )

    payment.payment_date = data.payment_date
    payment.amount = data.amount
    payment.payment_mode = data.payment_mode
    payment.reference_number = data.reference_number
    payment.notes = data.notes

    db.commit()
    db.refresh(payment)

    return payment


@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_master),
):
    payment = db.get(
        SugarPayment,
        payment_id,
    )

    if not payment or not payment.is_active:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found",
        )

    payment.is_active = False

    db.commit()

    return {
        "success": True,
        "message": "Payment record deactivated successfully",
        "payment_id": payment_id,
    }