import { useState, useCallback, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:3000/pacientes/search';

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

            const url = new URL(API_URL);
            if (query.length >= 3) url.searchParams.append('q', query);
            if (estado !== 'todos') url.searchParams.append('estado', estado);

            url.searchParams.append('page', pageNum.toString());
            url.searchParams.append('limit', '10');

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Error al buscar pacientes');

            const rawData = await response.json();
            const newPacientes = Array.isArray(rawData) ? rawData : (rawData.data || []);
            const total = Array.isArray(rawData) ? rawData.length : (rawData.total || 0);

            if (pageNum === 1) {
                setPacientes(newPacientes);
            } else {
                setPacientes(prev => [...prev, ...newPacientes]);
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