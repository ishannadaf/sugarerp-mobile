import {
  apiGet,
} from './apiClient';


export async function getDashboardSummary() {
  return apiGet('/dashboard/summary');
}


export async function getMembers() {
  return apiGet('/members');
}