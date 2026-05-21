// hooks/usePacientes.ts
import { useState, useCallback, useEffect } from 'react';

const API_URL = 'http://localhost:3000/pacientes'; // Ajusta a tu IP local

interface PacienteFilters {
    query?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export const usePacientes = (filters: PacienteFilters = {}) => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPacientes = useCallback(async () => {
        setLoading(true);
        try {
            const url = new URL(API_URL);

            if (filters.query) url.searchParams.append('search', filters.query);
            if (filters.fechaInicio) url.searchParams.append('fecha_inicio', filters.fechaInicio);
            if (filters.fechaFin) url.searchParams.append('fecha_fin', filters.fechaFin);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Error al obtener pacientes');

            const data = await response.json();
            setPacientes(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters.query, filters.fechaInicio, filters.fechaFin]);

    useEffect(() => {
        fetchPacientes();
    }, [fetchPacientes]);

    return { pacientes, loading, error, refetch: fetchPacientes };
};