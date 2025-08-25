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

  // [수정] API 경로에 '/api/'를 추가합니다.
  const res = await aiApi.post('/api/ai/recommend/', payload);
  return res.data;
};

/**
 * AI가 생성/보낸 연결요청 목록 조회
 * (선택) user_id 쿼리로 필터링 가능
 */
export const getAIRequests = async (userId = null) => {
  // [수정] API 경로에 '/api/'를 추가합니다.
  const res = await aiApi.get('/api/ai/requests/', {
    params: userId ? { user_id: userId } : {},
  });
  return res.data;
};

/**
 * 연결요청 상태 업데이트
 * 백엔드: request_id 필드 이름 사용
 */
export const updateAIRequest = async (requestId, status) => {
  // [수정] API 경로에 '/api/'를 추가합니다.
  const res = await aiApi.patch('/api/ai/requests/', {
    request_id: requestId, // 🔑 id → request_id
    status,
  });
  return res.data;
};

/**
 * 연결 후 피드백 등록
 * (백엔드 Serializer 스키마에 맞춰 전달)
 */
export const postAIFeedback = async (feedbackData) => {
  // [수정] API 경로에 '/api/'를 추가합니다.
  const res = await aiApi.post('/api/ai/feedback/', feedbackData);
  return res.data;
};

/**
 * AI 검색 홈/검색
 * GET /api/ai  (q 파라미터로 검색)
 */
export const getAIHomeData = async (q = '') => {
  // [수정] API 경로에 '/api/'를 추가합니다.
  const res = await aiApi.get('/api/ai', {
    params: q ? { q } : {},
  });
  return res.data;
};
