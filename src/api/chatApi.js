import axios from 'axios';

const chatApi = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
chatApi.interceptors.request.use(
  (config) => {
    // CORS 문제를 피하기 위해 커스텀 헤더는 제거하고 URL 파라미터나 body에 포함
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
chatApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default chatApi;