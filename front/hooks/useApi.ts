import { useAuthStore } from '../store/authStore';

const BASE_URL = 'http://localhost:3000';

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Sesión expirada');
    }
    return res;
}
