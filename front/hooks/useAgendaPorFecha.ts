import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './useApi';

export interface PacienteAgendaItem {
    paciente_id: number;
    paciente_nombre: string;
    paciente_apellido: string;
    cedula: string;
    vacuna: string;
    dosis: string;
    fecha_sugerida: string;
    estado: string;
}

export const useAgendaPorFecha = (fecha: string) => {
    const [items, setItems] = useState<PacienteAgendaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAgenda = useCallback(async () => {
        if (!fecha) return;
        setLoading(true);
        try {
            const response = await apiFetch(`/agenda/pacientes-por-fecha?fecha=${fecha}`);
            if (!response.ok) throw new Error('Error al obtener agenda');
            const data: PacienteAgendaItem[] = await response.json();
            setItems(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [fecha]);

    useEffect(() => {
        fetchAgenda();
    }, [fetchAgenda]);

    return { items, loading, error, refetch: fetchAgenda };
};
