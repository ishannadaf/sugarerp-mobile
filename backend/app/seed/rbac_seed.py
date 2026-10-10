from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import Role, Permission


PERMISSIONS = [
    ("USER_VIEW", "View users"),
    ("USER_CREATE", "Create users"),
    ("USER_EDIT", "Edit users"),
    ("USER_DELETE", "Delete users"),

    ("ROLE_VIEW", "View roles"),
    ("ROLE_CREATE", "Create roles"),
    ("ROLE_EDIT", "Edit roles"),

    ("MEMBER_VIEW", "View members"),
    ("MEMBER_CREATE", "Create members"),
    ("MEMBER_EDIT", "Edit members"),
    ("MEMBER_DELETE", "Delete members"),

    ("ROUTE_VIEW", "View routes"),
    ("ROUTE_CREATE", "Create routes"),
    ("ROUTE_EDIT", "Edit routes"),
    ("ROUTE_DELETE", "Delete routes"),

    ("VILLAGE_VIEW", "View villages"),
    ("VILLAGE_CREATE", "Create villages"),
    ("VILLAGE_EDIT", "Edit villages"),

    ("RATE_VIEW", "View rates"),
    ("RATE_CREATE", "Create rates"),
    ("RATE_EDIT", "Edit rates"),

    ("STOCK_VIEW", "View stock"),
    ("STOCK_CREATE", "Add stock"),
    ("STOCK_EDIT", "Edit stock"),

    ("DISTRIBUTION_VIEW", "View distribution"),
    ("DISTRIBUTION_CREATE", "Create distribution"),
    ("DISTRIBUTION_EDIT", "Edit distribution"),
    ("DISTRIBUTION_DELETE", "Delete distribution"),

    ("PAYMENT_VIEW", "View payments"),
    ("PAYMENT_CREATE", "Create payments"),
    ("PAYMENT_EDIT", "Edit payments"),

    ("REPORT_VIEW", "View reports"),
    ("REPORT_EXPORT", "Export reports"),

    ("AUDIT_VIEW", "View audit logs"),
    
    ("FINANCIAL_YEAR_VIEW", "View financial years"),
    ("FINANCIAL_YEAR_CREATE", "Create financial years"),
    ("FINANCIAL_YEAR_EDIT", "Edit financial years"),
]


ROLES = {
    "MASTER": {
        "description": "Full system administrator",
        "permissions": [code for code, _ in PERMISSIONS],
    },
    "DISTRIBUTION_WORKER": {
        "description": "Field worker who creates distribution entries",
        "permissions": [
            "MEMBER_VIEW",
            "ROUTE_VIEW",
            "VILLAGE_VIEW",
            "RATE_VIEW",
            "STOCK_VIEW",
            "DISTRIBUTION_VIEW",
            "DISTRIBUTION_CREATE",
        ],
    },
    "SUPERVISOR": {
        "description": "Supervisor who manages field operations",
        "permissions": [
            "MEMBER_VIEW",
            "MEMBER_CREATE",
            "MEMBER_EDIT",
            "ROUTE_VIEW",
            "ROUTE_CREATE",
            "ROUTE_EDIT",
            "VILLAGE_VIEW",
            "VILLAGE_CREATE",
            "VILLAGE_EDIT",
            "RATE_VIEW",
            "STOCK_VIEW",
            "DISTRIBUTION_VIEW",
            "DISTRIBUTION_EDIT",
            "PAYMENT_VIEW",
            "REPORT_VIEW",
            "REPORT_EXPORT",
        ],
    },
}


def seed_rbac():
    db = SessionLocal()

    try:
        permission_objects = {}

        # -----------------------------
        # Permissions
        # -----------------------------
        for code, description in PERMISSIONS:

            permission = db.scalar(
                select(Permission).where(
                    Permission.code == code
                )
            )

            if not permission:
                permission = Permission(
                    code=code,
                    description=description,
                )

                db.add(permission)
                db.flush()

            permission_objects[code] = permission

        # -----------------------------
        # Roles
        # -----------------------------
        for role_name, role_data in ROLES.items():

            role = db.scalar(
                select(Role).where(
                    Role.name == role_name
                )
            )

            if not role:
                role = Role(
                    name=role_name,
                    description=role_data["description"],
                )

                db.add(role)
                db.flush()

            role.permissions = [
                permission_objects[permission_code]
                for permission_code in role_data["permissions"]
            ]

        db.commit()

        print("RBAC seed completed successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_rbac()