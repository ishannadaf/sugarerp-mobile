import {
  apiGet,
  apiPost,
  apiPut,
} from './apiClient';

/**
 * Get all active sugar rates.
 *
 * Optional:
 * financialYearId
 */
export async function getRates({ financialYearId } = {}) {
  const params = new URLSearchParams();

  if (financialYearId) {
    params.append('financial_year_id', String(financialYearId));
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/rates?${queryString}`
    : '/rates';

  return apiGet(endpoint);
}

/**
 * Create a new sugar rate.
 */
export async function createRate(rateData) {
  return apiPost('/rates', rateData);
}

/**
 * Update an existing sugar rate.
 */
export async function updateRate(rateId, rateData) {
  return apiPut(`/rates/${rateId}`, rateData);
}