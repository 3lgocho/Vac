import { useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from './useApi';

export interface PacienteSearch {
    id: number;
    cedula: string;
    nacionalidad: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
}

export type FiltroEstado = 'todos' | 'agendados' | 'atrasados';

export const useBusquedaPacientes = () => {
    const [pacientes, setPacientes] = useState<PacienteSearch[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Guardamos la búsqueda y el estado actual para la paginación
    const currentQuery = useRef('');
    const currentEstado = useRef<FiltroEstado>('todos');

    const fetchPacientes = useCallback(async (query: string = '', estado: FiltroEstado = 'todos', pageNum: number = 1) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            currentQuery.current = query;
            currentEstado.current = estado;

            const params = new URLSearchParams();
            if (query.length >= 1) params.append('q', query);
            if (estado !== 'todos') params.append('estado', estado);
            params.append('page', pageNum.toString());
            params.append('limit', '10');

            const response = await apiFetch(`/pacientes/search?${params.toString()}`);
            if (!response.ok) throw new Error('Error al buscar pacientes');

            const rawData = await response.json();
            const newPacientes = Array.isArray(rawData) ? rawData : (rawData.data || []);
            const total = Array.isArray(rawData) ? rawData.length : (rawData.total || 0);

            if (pageNum === 1) {
                setPacientes(newPacientes);
            } else {
                setPacientes(prev => {
                    // Evitar duplicados por race conditions
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newPacientes.filter((p: PacienteSearch) => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
            }

            setHasMore(newPacientes.length > 0 && (pageNum * 10) < total);
            setPage(pageNum);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchPacientes(currentQuery.current, currentEstado.current, page + 1);
        }
    }, [loadingMore, hasMore, loading, page, fetchPacientes]);

    return { pacientes, loading, loadingMore, fetchPacientes, loadMore };
};