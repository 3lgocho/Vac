// front/hooks/useBiologicos.ts
import { useState, useCallback } from 'react';
import { apiFetch } from './useApi';

// Interfaces tipadas para aprovechar TypeScript en tu UI
export interface Dosis {
    id: number;
    nombre_dosis: string;
    orden_aplicacion: number;
}

export interface Biologico {
    id: number;
    nombre: string;
    descripcion: string | null;
    dosis: Dosis[];
}

export const useBiologicos = () => {
    const [biologicos, setBiologicos] = useState<Biologico[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBiologicos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/biologicos');
            if (!response.ok) throw new Error('Error al obtener el catálogo de biológicos');

            const data = await response.json();
            setBiologicos(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        biologicos,
        loading,
        error,
        fetchBiologicos,
    };
};