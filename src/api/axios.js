import axios from "axios";

const api = axios.create({
  baseURL: "http://13.124.106.69:8000", // 서비스 주소
  timeout: 10000,
  withCredentials: false,
  headers: { "Content-Type": "application/json" }
});

export default api;
