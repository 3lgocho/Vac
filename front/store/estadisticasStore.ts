import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'http://localhost:3000/estadisticas';

export interface EstadisticaItem {
    mes: number;
    genero_f: number;
    genero_m: number;
    edad_0_11_meses: number;
    edad_1_4_anos: number;
    edad_5_19_anos: number;
    edad_20_59_anos: number;
    edad_60_79_anos: number;
    edad_80_mas: number;
}

interface EstadisticasState {
    datos: EstadisticaItem[];
    isLoading: boolean;
    error: string | null;
    fetchEstadisticas: (anio: number, mes_inicio: number, mes_fin: number) => Promise<void>;
}

export const useEstadisticasStore = create<EstadisticasState>((set) => ({
    datos: [],
    isLoading: false,
    error: null,
    fetchEstadisticas: async (anio: number, mes_inicio: number, mes_fin: number) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}?anio=${anio}&mes_inicio=${mes_inicio}&mes_fin=${mes_fin}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener estadísticas');
            }

            const data = await response.json();
            set({ datos: data.datos, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    }
}));
