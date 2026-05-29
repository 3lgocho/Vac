import { create } from 'zustand';
import { Platform } from 'react-native';

const API_URL = 'http://localhost:3000/auth';

const isWeb = Platform.OS === 'web';

const storage = {
    async getItem(key: string): Promise<string | null> {
        if (isWeb) {
            return localStorage.getItem(key);
        }
        try {
            const { getItemAsync } = await import('expo-secure-store');
            return await getItemAsync(key);
        } catch {
            return null;
        }
    },
    async setItem(key: string, value: string): Promise<void> {
        if (isWeb) {
            localStorage.setItem(key, value);
            return;
        }
        try {
            const { setItemAsync } = await import('expo-secure-store');
            await setItemAsync(key, value);
        } catch {
            localStorage.setItem(key, value);
        }
    },
    async removeItem(key: string): Promise<void> {
        if (isWeb) {
            localStorage.removeItem(key);
            return;
        }
        try {
            const { deleteItemAsync } = await import('expo-secure-store');
            await deleteItemAsync(key);
        } catch {
            localStorage.removeItem(key);
        }
    },
};

interface AuthState {
    token: string | null;
    nombre: string | null;
    rol: string | null;
    isLoading: boolean;
    login: (cedula: string, pin: string) => Promise<string | null>;
    logout: () => Promise<void>;
    loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    nombre: null,
    rol: null,
    isLoading: true,

    loadSession: async () => {
        try {
            const [token, nombre, rol] = await Promise.all([
                storage.getItem('auth_token'),
                storage.getItem('auth_nombre'),
                storage.getItem('auth_rol'),
            ]);
            if (token && nombre) {
                set({ token, nombre, rol, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },

    login: async (cedula: string, pin: string) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula, pin }),
            });
            const data = await res.json();
            if (!res.ok) {
                return data.error || 'Error al iniciar sesión';
            }
            await Promise.all([
                storage.setItem('auth_token', data.token),
                storage.setItem('auth_nombre', data.nombre),
                storage.setItem('auth_rol', data.rol),
            ]);
            set({ token: data.token, nombre: data.nombre, rol: data.rol });
            return null;
        } catch {
            return 'Error de conexión con el servidor';
        }
    },

    logout: async () => {
        await Promise.all([
            storage.removeItem('auth_token'),
            storage.removeItem('auth_nombre'),
            storage.removeItem('auth_rol'),
        ]);
        set({ token: null, nombre: null, rol: null });
    },
}));
