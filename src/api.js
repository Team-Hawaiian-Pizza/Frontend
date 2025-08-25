import api from './api/axios.js';
// localStorage에서 user_id 가져오기 헬퍼
const getMyUserId = () => {
  return localStorage.getItem('user_id') || localStorage.getItem('userId');
};

// 특정 사용자 프로필 조회
export const getUserProfile = (profileId) => {
  const myUserId = getMyUserId();
  return api.get(`/users/profiles/${profileId}`, {
    params: { user_id: myUserId },
  });
};

// 내 초대 번호 조회
export const getMyCode = () => {
  const myUserId = getMyUserId();
  return api.get('/connections/my-code', {
    params: { user_id: myUserId },
  });
};

// 코드로 친구 추가
export const enterFriendCode = (code) => {
  const myUserId = getMyUserId();
  return api.post('/connections/enter-code', { code }, {
    params: { user_id: myUserId },
  });
};

// 연결 요청 목록 조회
export const getRequests = () => {
  const myUserId = getMyUserId();
  return api.get('/connections/requests', {
    params: { user_id: myUserId },
  });
};

// 연결 요청 수락
export const acceptRequest = (requestID) => {
  return api.post(`/connections/accept/${requestID}`, {
    user_id: getMyUserId(),
  });
};

// 연결 요청 거절
export const rejectRequest = (requestID) => {
  return api.post(`/connections/reject/${requestID}`, {
    user_id: getMyUserId(),
  });
};