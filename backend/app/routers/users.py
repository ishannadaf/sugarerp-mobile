from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User


router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    permissions = set()

    for role in current_user.roles:
        for permission in role.permissions:
            if permission.is_active:
                permissions.add(permission.code)

    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "mobile_number": current_user.mobile_number,
            "is_active": current_user.is_active,
            "roles": [
                role.name
                for role in current_user.roles
                if role.is_active
            ],
            "permissions": sorted(permissions),
        },
    }