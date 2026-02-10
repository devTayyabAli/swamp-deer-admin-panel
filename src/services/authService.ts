import api from '../lib/axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/login', credentials);
    if (response.data?.success && response.data?.data?.token) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
    }
    return response.data;
};

export const adminLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/admin-login', credentials);
    if (response.data?.success && response.data?.data?.token) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
    }
    return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/register', credentials);
    return response.data?.data || response.data;
};

export const getUsers = async (page = 1, limit = 10, roles: string[] = []): Promise<{ items: any[], page: number, pages: number, total: number }> => {
    const roleQuery = roles.length > 0 ? `&role=${roles.join(',')}` : '';
    const response = await api.get<any>(`/auth/users?page=${page}&limit=${limit}${roleQuery}`);
    return response.data?.data || response.data;
};

export const toggleUserStatus = async (id: string): Promise<any> => {
    const response = await api.put<any>(`/auth/users/${id}/status`);
    return response.data?.data || response.data;
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCurrentUser = (): AuthResponse | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};
