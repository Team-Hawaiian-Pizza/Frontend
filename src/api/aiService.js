import aiApi from './aiApi';

/**
 * AI 기반 인맥 추천 생성
 * 백엔드 Serializer가 요구하는 필드: user_id, request_text, (optional) max_recommendations
 */
export const recommendFriends = async () => {
  const userId = localStorage.getItem('user_id');
  if (!userId) throw new Error('AI 추천을 위해 로그인이 필요합니다.');

  const payload = {
    user_id: Number(userId),
    request_text: '인맥 추천',   // 기본값
    max_recommendations: 10,     // 필요 시 조정
  };

  const res = await aiApi.post('/recommend/', payload);
  return res.data;
};

/**
 * AI 검색 (수정됨: POST 요청으로 변경)
 * 검색어도 추천과 동일한 POST API를 사용하도록 수정합니다.
 */
export const getAIHomeData = async (q = '') => {
  const userId = localStorage.getItem('user_id');
  if (!userId) throw new Error('AI 검색을 위해 로그인이 필요합니다.');

  const payload = {
    user_id: Number(userId),
    request_text: q, // 검색어를 request_text에 담아 보냅니다.
    max_recommendations: 10,
  };

  // GET이 아닌 POST로, recommendFriends와 동일한 엔드포인트를 사용합니다.
  const res = await aiApi.post('/recommend/', payload);
  return res.data;
};


// --- 아래 함수들은 기존과 동일합니다 ---

/**
 * AI가 생성/보낸 연결요청 목록 조회
 */
export const getAIRequests = async (userId = null) => {
  const res = await aiApi.get('/requests/', {
    params: userId ? { user_id: userId } : {},
  });
  return res.data;
};

/**
 * 연결요청 상태 업데이트
 */
export const updateAIRequest = async (requestId, status) => {
  const res = await aiApi.patch('/requests/', {
    request_id: requestId,
    status,
  });
  return res.data;
};

/**
 * 연결 후 피드백 등록
 */
export const postAIFeedback = async (feedbackData) => {
  const res = await aiApi.post('/feedback/', feedbackData);
  return res.data;
};
