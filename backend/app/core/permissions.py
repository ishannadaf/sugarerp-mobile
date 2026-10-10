from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models import User


def require_permission(permission_code: str):
    def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        for role in current_user.roles:
            if not role.is_active:
                continue

            for permission in role.permissions:
                if (
                    permission.is_active
                    and permission.code == permission_code
                ):
                    return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission required: {permission_code}",
        )

    return permission_checker