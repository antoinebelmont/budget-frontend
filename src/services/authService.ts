import apiService from './api';
import { AuthResponse, LoginForm, RegisterForm, User } from '../types/apiTypes';

export class AuthService {
    async login(credentials: LoginForm): Promise<AuthResponse> {
        const response = await apiService.post<AuthResponse>('/auth/login', credentials);

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        return response;
    }

    async register(userData: RegisterForm): Promise<AuthResponse> {
        const response = await apiService.post<AuthResponse>('/auth/register', userData);

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        return response;
    }

    async logout(): Promise<void> {
        try {
            await apiService.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    }

    async me(): Promise<{ user: User }> {
        return await apiService.get('/auth/me');
    }

    getCurrentUser(): User | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export const authService = new AuthService();