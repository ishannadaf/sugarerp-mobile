
from getpass import getpass

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User, Role


def create_master_user():
    print("\n=== SugarERP Master Account Setup ===")

    username = input("Username: ").strip()
    full_name = input("Full name: ").strip()
    mobile_number = input("Mobile number (optional): ").strip() or None

    if not username or not full_name:
        print("Username and full name are required.")
        return

    password = getpass("Password: ")
    confirm_password = getpass("Confirm password: ")

    if not password:
        print("Password cannot be empty.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(User).where(User.username == username)
        )

        if existing_user:
            print("This username already exists. No changes were made.")
            return

        master_role = db.scalar(
            select(Role).where(Role.name == "MASTER")
        )

        if not master_role:
            print("MASTER role not found. Run the RBAC seed first.")
            return

        if not master_role.is_active:
            print("MASTER role is inactive. Activate it before proceeding.")
            return

        user = User(
            username=username,
            password_hash=hash_password(password),
            full_name=full_name,
            mobile_number=mobile_number,
            is_active=True,
        )

        user.roles.append(master_role)

        db.add(user)
        db.commit()
        db.refresh(user)

        print("\nMaster account created successfully.")
        print(f"User ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Role: {master_role.name}")
        print("Password stored as a secure hash.")

    except Exception as error:
        db.rollback()
        print(f"Account creation failed: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_master_user()
