import axios from 'axios';

// AI 서버 전용 Axios 인스턴스
const aiApi = axios.create({
  baseURL: 'http://localhost:8001/api/ai',
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