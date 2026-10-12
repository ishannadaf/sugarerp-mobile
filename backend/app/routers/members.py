from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import Member, Village, User
from app.models.share_capital import MemberShareCapital
from app.schemas.master import MemberCreate, MemberResponse


router = APIRouter(
    prefix="/api/v1/members",
    tags=["Members"],
)


def sync_member_shares(db: Session, member: Member, new_count: int):
    existing = db.scalars(
        select(MemberShareCapital)
        .where(MemberShareCapital.member_id == member.id)
        .order_by(MemberShareCapital.share_number)
    ).all()

    by_number = {row.share_number: row for row in existing}

    # Do not remove share records that contain payments.
    for row in existing:
        if row.share_number > new_count:
            if float(row.amount_paid) > 0:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Share {row.share_number} has a recorded payment. "
                        "Its payment must be resolved before reducing shares."
                    ),
                )
            db.delete(row)

    # Create a zero-payment record for every new share.
    for share_number in range(1, new_count + 1):
        if share_number not in by_number:
            db.add(
                MemberShareCapital(
                    member_id=member.id,
                    share_number=share_number,
                    amount_paid=0,
                )
            )


@router.post("", response_model=MemberResponse)
def create_member(
    data: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("MEMBER_CREATE")
    ),
):
    existing = db.scalar(
        select(Member).where(Member.member_code == data.member_code)
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Member code already exists",
        )

    village = db.get(Village, data.village_id)
    if not village:
        raise HTTPException(
            status_code=404,
            detail="Village not found",
        )

    try:
        member = Member(
            member_code=data.member_code,
            full_name=data.full_name,
            mobile_number=data.mobile_number,
            village_id=data.village_id,
            shares=data.shares,
            eligibility_kg=data.eligibility_kg,
            address=data.address,
        )
        db.add(member)
        db.flush()

        sync_member_shares(db, member, data.shares)

        db.commit()
        db.refresh(member)
        return member
    except Exception:
        db.rollback()
        raise


@router.get("", response_model=list[MemberResponse])
def get_members(
    village_id: int | None = None,
    search: str | None = None,
    # Keep these optional so existing Dashboard/Reports/Distribution
    # callers without pagination retain their previous full-list behavior.
    limit: int | None = Query(default=None, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("MEMBER_VIEW")
    ),
):
    query = select(Member).where(Member.is_active.is_(True))

    if village_id is not None:
        query = query.where(Member.village_id == village_id)

    if search and search.strip():
        search_value = f"%{search.strip()}%"
        query = query.where(
            or_(
                Member.full_name.ilike(search_value),
                Member.member_code.ilike(search_value),
                Member.mobile_number.ilike(search_value),
                Member.address.ilike(search_value),
                Member.village.has(Village.name.ilike(search_value)),
            )
        )

    query = query.order_by(Member.full_name, Member.id)

    if limit is not None:
        query = query.limit(limit).offset(offset)

    return db.scalars(query).all()


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: int,
    data: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("MEMBER_EDIT")
    ),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    village = db.get(Village, data.village_id)
    if not village:
        raise HTTPException(
            status_code=404,
            detail="Village not found",
        )

    existing = db.scalar(
        select(Member).where(
            Member.member_code == data.member_code,
            Member.id != member_id,
        )
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Member code already exists",
        )

    try:
        member.member_code = data.member_code
        member.full_name = data.full_name
        member.mobile_number = data.mobile_number
        member.village_id = data.village_id
        member.eligibility_kg = data.eligibility_kg
        member.address = data.address

        sync_member_shares(db, member, data.shares)
        member.shares = data.shares

        db.commit()
        db.refresh(member)
        return member
    except Exception:
        db.rollback()
        raise


@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("MEMBER_DELETE")
    ),
):
    member = db.get(Member, member_id)
    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    member.is_active = False
    db.commit()

    return {
        "success": True,
        "message": "Member deactivated successfully",
        "member_id": member_id,
    }
