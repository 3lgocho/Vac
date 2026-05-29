import { useState, useEffect, useRef } from 'react';
import { apiFetch } from './useApi';

export interface NextVaccineInfo {
    paciente_id: number;
    estado: string;
    proxima_vacuna: string | null;
    proxima_dosis: string | null;
    proxima_fecha: string | null;
    vacunas_atrasadas: string[];
}

export const useNextVaccines = (patientIds: number[]) => {
    const [vaccines, setVaccines] = useState<Record<number, NextVaccineInfo | null>>({});
    const prevIds = useRef('');

    useEffect(() => {
        const idsKey = patientIds.join(',');
        if (!idsKey || idsKey === prevIds.current) return;
        prevIds.current = idsKey;

        apiFetch('/pacientes/next-vaccines', {
            method: 'POST',
            body: JSON.stringify({ ids: patientIds }),
        }).then(r => r.json())
            .then((data: NextVaccineInfo[]) => {
                const map: Record<number, NextVaccineInfo | null> = {};
                data.forEach(item => {
                    map[item.paciente_id] = item;
                });
                setVaccines(map);
            })
            .catch(err => console.error('Error fetching next vaccines:', err));
    }, [patientIds]);

    return vaccines;
};
