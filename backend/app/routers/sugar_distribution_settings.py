
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import User
from app.models.distribution_setting import SugarDistributionSetting


router = APIRouter(
    prefix="/api/v1/settings/sugar-distribution",
    tags=["Sugar Distribution Settings"],
)


class SugarDistributionSettingUpdate(BaseModel):
    allow_10k: bool
    allow_15k: bool


def require_master(current_user: User):
    role_names = {role.name for role in current_user.roles}

    if "MASTER" not in role_names:
        raise HTTPException(
            status_code=403,
            detail="Only MASTER users can change sugar distribution settings",
        )

    return current_user


def get_or_create_setting(db: Session):
    setting = db.scalar(
        select(SugarDistributionSetting).where(
            SugarDistributionSetting.id == 1
        )
    )

    if not setting:
        setting = SugarDistributionSetting(
            id=1,
            allow_10k=True,
            allow_15k=True,
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)

    return setting


@router.get("")
def get_sugar_distribution_setting(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("DISTRIBUTION_VIEW")
    ),
):
    setting = get_or_create_setting(db)

    return {
        "allow_10k": setting.allow_10k,
        "allow_15k": setting.allow_15k,
    }


@router.put("")
def update_sugar_distribution_setting(
    data: SugarDistributionSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("DISTRIBUTION_EDIT")
    ),
):
    require_master(current_user)

    if not data.allow_10k and not data.allow_15k:
        raise HTTPException(
            status_code=400,
            detail="Select at least one contribution category",
        )

    setting = get_or_create_setting(db)

    setting.allow_10k = data.allow_10k
    setting.allow_15k = data.allow_15k

    db.commit()
    db.refresh(setting)

    return {
        "success": True,
        "message": "Sugar distribution settings updated successfully",
        "allow_10k": setting.allow_10k,
        "allow_15k": setting.allow_15k,
    }
