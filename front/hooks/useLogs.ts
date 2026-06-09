import { useState, useCallback } from 'react';
import { apiFetch } from './useApi';

export interface AuditLog {
    id: number;
    personal_id: number;
    nombre_personal: string;
    accion: string;
    entidad_tipo: string;
    entidad_id: number | null;
    detalles: string;
    creado_en: string;
}

export const useLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const fetchLogs = useCallback(async (searchTerm: string, resetPage = false) => {
        const currentPage = resetPage ? 1 : page;
        if (resetPage) {
            setLoading(true);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const res = await apiFetch(`/logs?q=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=20`);
            const data = await res.json();

            setLogs(prev => resetPage ? data.data : [...prev, ...data.data]);
            setTotal(data.total);
            if (!resetPage) setPage(p => p + 1);
            else if (data.data.length > 0) setPage(2);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [page]);

    const loadMore = useCallback((searchTerm: string) => {
        if (!loadingMore && !loading && logs.length < total) {
            fetchLogs(searchTerm, false);
        }
    }, [loadingMore, loading, logs.length, total, fetchLogs]);

    return { logs, loading, loadingMore, fetchLogs, loadMore, total };
};
