import { useState, useEffect, useCallback, useRef } from 'react';
import { useRegistroStore } from '../store/registroStore';
import { apiFetch } from './useApi';

export interface VacunaDisponible {
    biologico_id: number;
    nombre: string;
    dosis_id: number;
    dosis_a_aplicar: string;
    advertencia: string | null;
}

export function useValidacion() {
    const fechaNacimiento = useRegistroStore((s) => s.fechaNacimiento);
    const gruposSeleccionados = useRegistroStore((s) => s.gruposSeleccionados);
    const vacunasSeleccionadas = useRegistroStore((s) => s.vacunasSeleccionadas);

    const [vacunasDisponibles, setVacunasDisponibles] = useState<VacunaDisponible[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const validar = useCallback(async () => {
        if (fechaNacimiento.length < 10) return;

        const [dia, mes, anio] = fechaNacimiento.split('/');
        const fechaNac = `${anio}-${mes}-${dia}`;

        const payload = {
            fecha_nacimiento: fechaNac,
            grupos_especiales: gruposSeleccionados,
            vacunas_aplicadas: vacunasSeleccionadas.map((v) => ({
                biologico_id: v.biologico_id,
                dosis_id: v.dosis_id,
                fecha_aplicacion: null, // Desde el registro global no tienen fecha aún
            })),
        };

        setLoading(true);
        setError(null);

        try {
            const res = await apiFetch('/validador/esquema', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${await res.text()}`);
            }

            const data: VacunaDisponible[] = await res.json();
            if (mountedRef.current) {
                setVacunasDisponibles(data);
            }
        } catch (err: any) {
            if (mountedRef.current) {
                setError(err.message);
                setVacunasDisponibles([]);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [fechaNacimiento, gruposSeleccionados, vacunasSeleccionadas]);

    useEffect(() => {
        mountedRef.current = true;
        if (fechaNacimiento.length === 10) {
            validar();
        }
        return () => {
            mountedRef.current = false;
        };
    }, [validar, fechaNacimiento]);

    return { vacunasDisponibles, loading, error, refetch: validar };
}
