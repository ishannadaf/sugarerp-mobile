import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from './apiClient';


// ============================================================
// GET MEMBERS
// ============================================================

export async function getMembers({
  villageId,
  search,
} = {}) {

  const params = new URLSearchParams();

  if (villageId) {
    params.append(
      'village_id',
      String(villageId)
    );
  }

  if (search && search.trim()) {
    params.append(
      'search',
      search.trim()
    );
  }

  const queryString =
    params.toString();

  const endpoint =
    queryString
      ? `/members?${queryString}`
      : '/members';

  return apiGet(endpoint);
}


// ============================================================
// CREATE MEMBER
// ============================================================

export async function createMember(
  memberData
) {
  return apiPost(
    '/members',
    memberData
  );
}


// ============================================================
// UPDATE MEMBER
// ============================================================

export async function updateMember(
  memberId,
  memberData
) {
  return apiPut(
    `/members/${memberId}`,
    memberData
  );
}


// ============================================================
// DELETE MEMBER
// ============================================================

export async function deleteMember(
  memberId
) {
  return apiDelete(
    `/members/${memberId}`
  );
}