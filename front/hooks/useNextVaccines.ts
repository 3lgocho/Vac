import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:3000/pacientes/next-vaccines';

export interface NextVaccineInfo {
    paciente_id: number;
    nombre_vacuna: string;
    dosis_a_aplicar: string;
    fecha_sugerida: string;
    estado: string;
}

export const useNextVaccines = (patientIds: number[]) => {
    const [vaccines, setVaccines] = useState<Record<number, NextVaccineInfo | null>>({});
    const prevIds = useRef('');

    useEffect(() => {
        const idsKey = patientIds.join(',');
        if (!idsKey || idsKey === prevIds.current) return;
        prevIds.current = idsKey;

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: patientIds }),
        })
            .then(r => r.json())
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
