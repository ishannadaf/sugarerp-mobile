import boto3
from botocore.config import Config

from app.core.config import settings


def get_r2_client():
    account_id = settings.R2_ACCOUNT_ID.strip()
    access_key = settings.R2_ACCESS_KEY_ID.strip()
    secret_key = settings.R2_SECRET_ACCESS_KEY.strip()

    if not account_id or not access_key or not secret_key:
        raise RuntimeError(
            "Cloudflare R2 configuration is incomplete. "
            "Check R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, "
            "and R2_SECRET_ACCESS_KEY."
        )

    endpoint_url = (
        f"https://{account_id}.r2.cloudflarestorage.com"
    )

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
        ),
    )


def generate_upload_url(
    object_key: str,
    content_type: str,
    expires_in: int = 900,
):
    client = get_r2_client()

    return client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.R2_BUCKET_NAME,
            "Key": object_key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in,
        HttpMethod="PUT",
    )


def generate_download_url(
    object_key: str,
    expires_in: int = 900,
):
    client = get_r2_client()

    return client.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": settings.R2_BUCKET_NAME,
            "Key": object_key,
        },
        ExpiresIn=expires_in,
        HttpMethod="GET",
    )
