import api from './api/axios.js';

// 특정 사용자 프로필 조회
export const getUserProfile = async (profileId) => {
    // 로그인 시 저장된 내 유저 ID를 가져옵니다.
  const myUserId =
    Number(localStorage.getItem('userId')) ||
    Number(localStorage.getItem('user_id')) || // 키 혼재 대비
    undefined;

    const response = await api.get(`/users/profiles/${profileId}`, {
        data: {
            user_id: parseInt(myUserId, 10)
        }
        // 헤더 성공한다면
        // hdeaders: {'User-Id' : myUserId}
    });
    return response.data;
};

// 내 초대 번호 조회
export const getMyCode = async () => {
  const myUserId =
    Number(localStorage.getItem('userId')) ||
    Number(localStorage.getItem('user_id')) ||
    undefined;

  const response = await api.get('/connections/my-code', {
    headers: myUserId ? { 'User-Id': String(myUserId) } : {},
    params: myUserId ? { user_id: myUserId } : {},
  });
  return response.data;
};