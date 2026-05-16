// front/constants/grupos_especiales.ts

export interface GrupoEspecialItem {
    id: string;
    label: string;
    value: string; // El snake_case que espera Rust
}

export const GRUPOS_ESPECIALES: GrupoEspecialItem[] = [
    { id: '01', label: 'Contingentes Militares', value: 'contingentes_militares' },
    { id: '02', label: 'Embarazadas', value: 'embarazadas' },
    { id: '03', label: 'Enfermos Crónicos', value: 'enfermos_cronicos' },
    { id: '04', label: 'Personal de Salud', value: 'personal_de_salud' },
    { id: '05', label: 'Pacientes en Diálisis', value: 'pacientes_en_dialisis' },
    { id: '06', label: 'Privados de Libertad', value: 'privados_de_libertad' },
    { id: '07', label: 'Trabajadores Avícolas', value: 'trabajadores_avicolas' },
    { id: '08', label: 'Trabajadores Sexuales', value: 'trabajadores_sexuales' },
    { id: '09', label: 'Viajeros Internac.', value: 'viajeros_internacionales' },
    { id: '10', label: 'Otro', value: 'otro' }
];