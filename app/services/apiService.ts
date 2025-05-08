import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'https://192.168.88.89:7241';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // 3s timeout
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/User/login', { email, password });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error during login:', axiosError.response?.data || axiosError.message);
    throw (axiosError.response?.data as { message?: string })?.message || axiosError.message || 'Login failed';
  }
};

export const register = async (email: string, password: string, username: string) => {
  try {
    const response = await api.post('/api/User/register', { email, password, username });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error during registration:', axiosError.response?.data || axiosError.message);
    throw (axiosError.response?.data as { message?: string })?.message || axiosError.message || 'Registration failed';
  }
};