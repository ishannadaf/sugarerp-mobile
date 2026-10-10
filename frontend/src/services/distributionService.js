import {
  apiGet,
  apiPost,
  
} from './apiClient';

/**
 * Get sugar distributions.
 *
 * Optional filters:
 * - routeId
 * - villageId
 * - memberId
 * - distributionDate
 * - fromDate
 * - toDate
 */
export async function getDistributions({
  routeId,
  villageId,
  memberId,
  distributionDate,
  fromDate,
  toDate,
} = {}) {
  const params = new URLSearchParams();

  if (routeId) {
    params.append('route_id', String(routeId));
  }

  if (villageId) {
    params.append('village_id', String(villageId));
  }

  if (memberId) {
    params.append('member_id', String(memberId));
  }

  if (distributionDate) {
    params.append('distribution_date', distributionDate);
  }

  if (fromDate) {
    params.append('from_date', fromDate);
  }

  if (toDate) {
    params.append('to_date', toDate);
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/distributions?${queryString}`
    : '/distributions';

  return apiGet(endpoint);
}

/**
 * Create a sugar distribution.
 */
export async function createDistribution(distributionData) {
  return apiPost('/distributions', distributionData);
}


/**
 * Delete a distribution.
 * Backend enforces MASTER-only access.
 */
export async function deleteDistribution(distributionId) {
  if (!distributionId) {
    throw new Error('Distribution ID is required.');
  }

  return apiDelete(`/distributions/${distributionId}`);
}
