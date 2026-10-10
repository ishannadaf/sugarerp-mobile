
from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.permissions import require_permission
from app.models import SugarDistribution, User
from app.services.r2_storage import generate_download_url


router = APIRouter(
    prefix="/api/v1/photos",
    tags=["Photos"],
)


MAX_PHOTO_SIZE = 10 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def check_distribution_access(distribution, current_user):
    role_names = {role.name for role in current_user.roles}

    if (
        "MASTER" not in role_names
        and distribution.worker_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot access this distribution",
        )


@router.post("/upload/{distribution_id}")
def upload_distribution_photo(
    distribution_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("DISTRIBUTION_CREATE")
    ),
):
    distribution = db.get(
        SugarDistribution,
        distribution_id,
    )

    if not distribution or not distribution.is_active:
        raise HTTPException(
            status_code=404,
            detail="Distribution record not found",
        )

    check_distribution_access(
        distribution,
        current_user,
    )

    extension = ALLOWED_TYPES.get(file.content_type)

    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WEBP images are allowed",
        )

    image_bytes = file.file.read(MAX_PHOTO_SIZE + 1)

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded photo is empty",
        )

    if len(image_bytes) > MAX_PHOTO_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Photo must be 10 MB or smaller",
        )

    object_key = (
        f"distributions/"
        f"{distribution.distribution_date.year}/"
        f"{distribution.distribution_date.month:02d}/"
        f"{distribution.id}/"
        f"{uuid4().hex}.{extension}"
    )

    try:
        client = boto3.client(
            "s3",
            endpoint_url=(
                f"https://{settings.R2_ACCOUNT_ID}"
                f".r2.cloudflarestorage.com"
            ),
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
        )

        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=object_key,
            Body=image_bytes,
            ContentType=file.content_type,
        )

    except (BotoCoreError, ClientError):
        raise HTTPException(
            status_code=502,
            detail=(
                "Cloud storage upload failed. "
                "Check the backend R2 configuration and credentials."
            ),
        )

    previous_photo = distribution.delivery_photo_url
    distribution.delivery_photo_url = object_key

    try:
        db.commit()
        db.refresh(distribution)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=(
                "Photo uploaded, but saving its reference failed. "
                "Please retry or contact the administrator."
            ),
        )

    return {
        "success": True,
        "message": "Delivery photo uploaded successfully",
        "distribution_id": distribution.id,
        "object_key": object_key,
        "previous_photo": previous_photo,
    }


@router.get("/distribution/{distribution_id}")
def get_distribution_photo(
    distribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_permission("DISTRIBUTION_VIEW")
    ),
):
    distribution = db.get(
        SugarDistribution,
        distribution_id,
    )

    if not distribution or not distribution.is_active:
        raise HTTPException(
            status_code=404,
            detail="Distribution record not found",
        )

    check_distribution_access(
        distribution,
        current_user,
    )

    if not distribution.delivery_photo_url:
        raise HTTPException(
            status_code=404,
            detail="No delivery photo attached",
        )

    try:
        download_url = generate_download_url(
            distribution.delivery_photo_url
        )
    except (BotoCoreError, ClientError):
        raise HTTPException(
            status_code=502,
            detail="Unable to generate the photo viewing URL",
        )

    return {
        "success": True,
        "distribution_id": distribution.id,
        "object_key": distribution.delivery_photo_url,
        "photo_url": download_url,
    }
