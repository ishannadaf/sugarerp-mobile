import { apiGet } from './apiClient';

// ============================================================
// DISTRICTS
// ============================================================

export async function getDistricts() {
  return apiGet('/master/districts');
}


// ============================================================
// TALUKAS
// ============================================================

export async function getTalukas({ districtId } = {}) {
  const params = new URLSearchParams();

  if (districtId) {
    params.append('district_id', String(districtId));
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/master/talukas?${queryString}`
    : '/master/talukas';

  return apiGet(endpoint);
}


// ============================================================
// VILLAGES
// ============================================================

export async function getVillages({
  routeId,
  talukaId,
  search,
} = {}) {
  const params = new URLSearchParams();

  if (routeId) {
    params.append('route_id', String(routeId));
  }

  if (talukaId) {
    params.append('taluka_id', String(talukaId));
  }

  if (search && search.trim()) {
    params.append('search', search.trim());
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/master/villages?${queryString}`
    : '/master/villages';

  return apiGet(endpoint);
}