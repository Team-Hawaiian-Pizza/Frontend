import api from './api/axios.js';
import chatApi from './api/chatApi';
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

// ===== 채팅 부부느 ====

// localStorage에서 username 가져오기 헬퍼
export const getMyUsername = () => {
  return localStorage.getItem('username'); 
};

// 내 모든 대화 목록 가져오기
export const getMyConversations = () => {
  const myUserId = getMyUsername();
  return chatApi.get(`/api/chat/users/${myUserId}/conversations/`);
};

// 새로운 대화 생성하기
export const createConversation = (otherUserId) => {
  const myUserId = getMyUsername();
  return chatApi.post('/api/chat/conversations/', {
    participant1_id: myUserId,
    participant2_id: otherUserId
  });
};