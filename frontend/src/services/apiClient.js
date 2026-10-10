import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../config/api';

const TOKEN_KEY = 'sugar_erp_access_token';

export const tokenStorage = {
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token) {
    if (!token) {
      throw new Error('Cannot save an empty authentication token.');
    }

    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async removeToken() {
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

async function parseResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function createApiError(response, data) {
  const message =
    data?.detail ||
    data?.message ||
    `Request failed with status ${response.status}`;

  const error = new Error(
    typeof message === 'string' ? message : JSON.stringify(message)
  );

  error.status = response.status;
  error.data = data;

  return error;
}

export async function apiRequest(endpoint, options = {}) {
  const token = await tokenStorage.getToken();

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // JSON is the default only when a body exists and the caller
  // has not supplied another content type.
  if (
    options.body != null &&
    !headers['Content-Type'] &&
    !(options.body instanceof FormData)
  ) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw createApiError(response, data);
  }

  return data;
}

export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

export async function apiPost(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiPut(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

/**
 * Upload multipart FormData using the same API URL and auth token.
 * Do not set Content-Type manually; fetch must add the multipart boundary.
 */
export async function apiUploadFile(endpoint, formData) {
  if (!(formData instanceof FormData)) {
    throw new Error('File upload requires a FormData body.');
  }

  return apiRequest(endpoint, {
    method: 'POST',
    body: formData,
  });
}
