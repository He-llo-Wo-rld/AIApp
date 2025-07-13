import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // змінити при деплої
  withCredentials: true,
});

export default api;
