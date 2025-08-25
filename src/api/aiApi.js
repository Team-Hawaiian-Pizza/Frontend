import axios from 'axios';

// AI 서버 전용 Axios 인스턴스
const aiApi = axios.create({
  baseURL: '/api/ai', // AI 백엔드 프록시 경로
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// 공통 응답/에러 로깅(선택)
aiApi.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[AI API ERROR]', err?.response?.status, err?.response?.data || err?.message);
    return Promise.reject(err);
  }
);

export default aiApi;