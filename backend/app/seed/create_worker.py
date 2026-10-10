
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User, Role


# ============================================================
# CONFIGURE YOUR 10 USER ACCOUNTS HERE
# Change usernames, passwords, and names as required.
# ============================================================

WORKERS = [
    {
        "username": "user1",
        "password": "VSSK@3701",
        "full_name": "Distribution Worker 1",
    },
    {
        "username": "user2",
        "password": "VSSK@3702",
        "full_name": "Distribution Worker 2",
    },
    {
        "username": "user3",
        "password": "VSSK@3703",
        "full_name": "Distribution Worker 3",
    },
    {
        "username": "user4",
        "password": "VSSK@3704",
        "full_name": "Distribution Worker 4",
    },
    {
        "username": "user5",
        "password": "VSSK@3705",
        "full_name": "Distribution Worker 5",
    },
    {
        "username": "user6",
        "password": "VSSK@3706",
        "full_name": "Distribution Worker 6",
    },
    {
        "username": "user7",
        "password": "VSSK@3707",
        "full_name": "Distribution Worker 7",
    },
    {
        "username": "user8",
        "password": "VSSK@3708",
        "full_name": "Distribution Worker 8",
    },
    {
        "username": "user9",
        "password": "VSSK@3709",
        "full_name": "Distribution Worker 9",
    },
    {
        "username": "user10",
        "password": "VSSK@3710",
        "full_name": "Distribution Worker 10",
    },
]


def create_workers():
    db = SessionLocal()

    try:
        worker_role = db.scalar(
            select(Role).where(
                Role.name == "DISTRIBUTION_WORKER"
            )
        )

        if not worker_role:
            raise RuntimeError(
                "DISTRIBUTION_WORKER role not found. "
                "Run the RBAC seed first."
            )

        # Prevent accidental duplicate usernames in the config.
        usernames = [worker["username"] for worker in WORKERS]

        if len(usernames) != len(set(usernames)):
            raise ValueError(
                "Duplicate usernames found in WORKERS configuration."
            )

        created_count = 0
        skipped_count = 0

        for worker_data in WORKERS:
            username = worker_data["username"].strip()
            password = worker_data["password"]
            full_name = worker_data["full_name"].strip()

            if not username or not password or not full_name:
                raise ValueError(
                    "Username, password, and full name are required."
                )

            existing_user = db.scalar(
                select(User).where(
                    User.username == username
                )
            )

            if existing_user:
                print(
                    f"SKIPPED: '{username}' already exists. "
                    "Existing password and role were not changed."
                )
                skipped_count += 1
                continue

            new_user = User(
                username=username,
                password_hash=hash_password(password),
                full_name=full_name,
                is_active=True,
            )

            # Assign only the distribution-worker role.
            new_user.roles.append(worker_role)

            db.add(new_user)
            created_count += 1

        db.commit()

        print("\n========== ACCOUNT CREATION SUMMARY ==========")
        print(f"Accounts created: {created_count}")
        print(f"Accounts skipped: {skipped_count}")
        print("================================================")

        print(
            "\nUse the usernames and passwords configured "
            "in WORKERS to log in."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_workers()
