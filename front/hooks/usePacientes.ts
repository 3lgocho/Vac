import { useState, useCallback, useEffect, useRef } from 'react'; // <- useRef agregado

const API_URL = 'http://localhost:3000/pacientes'; // Ajusta a tu IP local / red o /pacientes/search

interface PacienteFilters {
    query?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface Paciente {
    id: number;
    cedula: string;
    nacionalidad: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    sexo: string;
    telefono?: string;
    correo?: string;
}

export const usePacientes = (initialFilters: PacienteFilters = {}) => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Mantenemos referencia de los filtros actuales para la paginación (scroll)
    const currentFilters = useRef<PacienteFilters>(initialFilters);

    const fetchPacientes = useCallback(async (filters: PacienteFilters = currentFilters.current, pageNum: number = 1) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            currentFilters.current = filters;
            const url = new URL(API_URL);

            // Lógica original de fechas y texto
            if (filters.query) url.searchParams.append('q', filters.query);
            if (filters.fechaInicio) url.searchParams.append('fecha_inicio', filters.fechaInicio);
            if (filters.fechaFin) url.searchParams.append('fecha_fin', filters.fechaFin);

            // Lógica nueva de paginación
            url.searchParams.append('page', pageNum.toString());
            url.searchParams.append('limit', '10');

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Error al obtener pacientes');

            const rawData = await response.json();

            // Compatibilidad: Si el backend devuelve array (endpoint viejo) o objeto {data, total} (endpoint nuevo)
            const newPacientes = Array.isArray(rawData) ? rawData : (rawData.data || []);
            const total = Array.isArray(rawData) ? rawData.length : (rawData.total || 0);

            if (pageNum === 1) {
                setPacientes(newPacientes);
            } else {
                setPacientes(prev => [...prev, ...newPacientes]);
            }

            setHasMore(newPacientes.length > 0 && (pageNum * 10) < total);
            setPage(pageNum);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        // Carga inicial
        fetchPacientes(initialFilters, 1);
    }, []); // Se ejecuta una vez al montar

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchPacientes(currentFilters.current, page + 1);
        }
    }, [loadingMore, hasMore, loading, page, fetchPacientes]);

    return {
        pacientes,
        loading,
        loadingMore,
        hasMore,
        error,
        fetchPacientes, // <- Exportado para usar en el Dashboard
        loadMore,       // <- Exportado para el onEndReached de la FlatList
        refetch: () => fetchPacientes(currentFilters.current, 1)
    };
};