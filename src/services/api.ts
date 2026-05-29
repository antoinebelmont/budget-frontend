import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import type { ImportResult } from '@/types/apiTypes';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const original = error.config;

                if (error.response?.status === 401 && !original._retry) {
                    original._retry = true;

                    // Clear auth data and redirect to login
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';

                    return Promise.reject(error);
                }

                // Handle other errors
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else if (error.message) {
                    toast.error(error.message);
                }

                return Promise.reject(error);
            }
        );
    }

    // Generic methods
    public async get<T>(url: string, params?: any): Promise<T> {
        const response: AxiosResponse<T> = await this.api.get(url, { params });
        return response.data;
    }

    public async post<T>(url: string, data?: any): Promise<T> {
        const response: AxiosResponse<T> = await this.api.post(url, data);
        return response.data;
    }

    public async put<T>(url: string, data?: any): Promise<T> {
        const response: AxiosResponse<T> = await this.api.put(url, data);
        return response.data;
    }

    public async delete<T>(url: string): Promise<T> {
        const response: AxiosResponse<T> = await this.api.delete(url);
        return response.data;
    }

    public async uploadAndImport(file: File, accountId: number): Promise<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('account_id', String(accountId));

        const response: AxiosResponse<ImportResult> = await this.api.post('/transactions/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
        });
        return response.data;
    }

    public async exportCsv(url: string, params?: Record<string, string>): Promise<Blob> {
        const response: AxiosResponse<Blob> = await this.api.get(url, {
            params,
            responseType: 'blob',
            timeout: 30000,
        });
        return response.data;
    }
}

export const apiService = new ApiService();
export default apiService;