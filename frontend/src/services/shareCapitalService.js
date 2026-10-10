
import { apiGet, apiPut } from './apiClient';

const BASE_PATH = '/share-capital';

/**
 * Get all active Share Capital rate tiers.
 */
export async function getShareCapitalRates() {
  return apiGet(`${BASE_PATH}/rates`);
}

/**
 * Update a Share Capital rate tier.
 */
export async function updateShareCapitalRate(
  tierCode,
  payload
) {
  return apiPut(
    `${BASE_PATH}/rates/${encodeURIComponent(tierCode)}`,
    payload
  );
}

/**
 * Get a member's individual share payments
 * and automatically calculated qualifying rate.
 */
export async function getMemberShareCapital(memberId) {
  if (!memberId) {
    throw new Error('Member ID is required.');
  }

  return apiGet(
    `${BASE_PATH}/members/${encodeURIComponent(memberId)}`
  );
}

/**
 * Save individual payment amounts for a member's shares.
 *
 * Expected payload:
 * {
 *   shares: 3,
 *   payments: [
 *     { share_number: 1, amount_paid: 15000 },
 *     { share_number: 2, amount_paid: 10000 },
 *     { share_number: 3, amount_paid: 5000 }
 *   ]
 * }
 */
export async function updateMemberShareCapital(
  memberId,
  payload
) {
  if (!memberId) {
    throw new Error('Member ID is required.');
  }

  return apiPut(
    `${BASE_PATH}/members/${encodeURIComponent(memberId)}`,
    payload
  );
}
