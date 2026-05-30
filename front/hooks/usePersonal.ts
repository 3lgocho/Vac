import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './useApi';

export interface PersonalSalud {
    id: number;
    cedula: string;
    nombre_completo: string;
    rol: string;
    activo: boolean;
    creado_en: string;
}

export function usePersonal() {
    const [personal, setPersonal] = useState<PersonalSalud[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPersonal = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch('/personal');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al cargar personal');
            }
            const data = await res.json();
            setPersonal(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPersonal();
    }, [loadPersonal]);

    const crearPersonal = async (data: { cedula: string; nombre_completo: string; rol: string; pin: string }) => {
        const res = await apiFetch('/personal', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || 'Error al crear');
        }
        await loadPersonal();
    };

    const actualizarPersonal = async (id: number, data: { cedula: string; nombre_completo: string; rol: string }) => {
        const res = await apiFetch(`/personal/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || 'Error al actualizar');
        }
        await loadPersonal();
    };

    const cambiarPin = async (id: number, pin: string) => {
        const res = await apiFetch(`/personal/${id}/pin`, {
            method: 'PATCH',
            body: JSON.stringify({ pin }),
        });
        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || 'Error al cambiar PIN');
        }
    };

    const eliminarPersonal = async (id: number) => {
        const res = await apiFetch(`/personal/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || 'Error al eliminar');
        }
        await loadPersonal();
    };

    return {
        personal,
        loading,
        error,
        loadPersonal,
        crearPersonal,
        actualizarPersonal,
        cambiarPin,
        eliminarPersonal,
    };
}
