
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { tokenStorage } from './apiClient';
import { BASE_URL } from '../config/api';

const TARGET_SIZE = 500 * 1024; // 500 KB

async function compressPhoto(fileUri) {
  const originalInfo = await FileSystem.getInfoAsync(fileUri);

  console.log(
    'Original photo size:',
    originalInfo.size
      ? `${(originalInfo.size / 1024).toFixed(0)} KB`
      : 'Unknown'
  );

  // Resize large images while preserving their aspect ratio.
  const resizeActions = [];

  if (originalInfo.width > 1280) {
    resizeActions.push({
      resize: { width: 1280 },
    });
  }

  // Try progressively lower JPEG quality until the image
  // is within the target size.
  const qualities = [0.75, 0.65, 0.55, 0.45, 0.35];

  let compressedUri = fileUri;
  let compressedSize = originalInfo.size || Infinity;

  for (const quality of qualities) {
    const result = await ImageManipulator.manipulateAsync(
      fileUri,
      resizeActions,
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const info = await FileSystem.getInfoAsync(result.uri);

    compressedUri = result.uri;
    compressedSize = info.size || Infinity;

    console.log(
      `Compressed photo (quality ${quality}):`,
      `${(compressedSize / 1024).toFixed(0)} KB`
    );

    if (compressedSize <= TARGET_SIZE) {
      break;
    }
  }

  // If still too large, resize further and compress again.
  if (compressedSize > TARGET_SIZE) {
    const resized = await ImageManipulator.manipulateAsync(
      compressedUri,
      [{ resize: { width: 960 } }],
      {
        compress: 0.4,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    compressedUri = resized.uri;

    const info = await FileSystem.getInfoAsync(compressedUri);
    compressedSize = info.size || Infinity;
  }

  console.log(
    'Final upload photo size:',
    `${(compressedSize / 1024).toFixed(0)} KB`
  );

  return compressedUri;
}

export async function uploadDistributionPhoto({
  distributionId,
  fileUri,
  fileName,
  contentType,
}) {
  if (!distributionId) {
    throw new Error('Distribution ID is required.');
  }

  if (!fileUri) {
    throw new Error('Photo URI is missing.');
  }

  const token = await tokenStorage.getToken();

  if (!token) {
    throw new Error(
      'Authentication token is missing. Please log in again.'
    );
  }

  // Compress before uploading.
  const compressedUri = await compressPhoto(fileUri);

  const url = `${BASE_URL}/photos/upload/${distributionId}`;

  const result = await FileSystem.uploadAsync(url, compressedUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'file',
    mimeType: 'image/jpeg',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    parameters: {},
  });

  let data = null;

  try {
    data = JSON.parse(result.body || '{}');
  } catch {
    // Handle non-JSON error responses below.
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Photo upload failed (HTTP ${result.status}).`
    );
  }

  if (!data?.success || !data?.object_key) {
    throw new Error(
      'The server did not confirm that the photo was saved.'
    );
  }

  return data;
}

export async function getDistributionPhoto(distributionId) {
  const token = await tokenStorage.getToken();

  const response = await fetch(
    `${BASE_URL}/photos/distribution/${distributionId}`,
    {
      headers: {
        Accept: 'application/json',
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      `Could not retrieve photo (HTTP ${response.status}).`
    );
  }

  return data;
}
