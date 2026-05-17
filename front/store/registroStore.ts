import { create } from 'zustand';

// --- NUEVA INTERFAZ PARA LAS VACUNAS ---
export interface VacunaSeleccionada {
    biologico_id: number;
    nombre: string;
    dosis_id: number;
    nombre_dosis: string;
}

// 1. Definimos todos los campos de tu formulario
interface RegistroState {
    // --- Paso 1 ---
    tipoDoc: string;
    cedula: string;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    genero: string;

    // --- Paso 2 ---
    fechaNacimiento: string;
    edad: string;
    ordenHijo: string;
    calle: string;
    numeroCasa: string;
    comunidad: string;
    esIndigena: boolean;
    etnia: string;
    etniaLabel: string;


    // --- Paso 3 ---

    gruposSeleccionados: string[];
    vacunasSeleccionadas: VacunaSeleccionada[];
    alergiasSeleccionadas: AlergiaSeleccionada[]; // <-- AÑADIDO

    // --- ACCIONES ---
    updateField: (field: keyof Omit<RegistroState, 'updateField' | 'toggleGrupo' | 'clearFormData' | 'addVacuna' | 'removeVacuna'>, value: any) => void;
    toggleGrupo: (grupo: string) => void;

    // Acciones para vacunas
    addVacuna: (vacuna: VacunaSeleccionada) => void;
    removeVacuna: (biologico_id: number, dosis_id: number) => void;

    // Limpieza
    clearFormData: () => void;
}

// 2. Separamos el estado inicial para poder resetearlo fácilmente
const initialState = {
    tipoDoc: 'V',
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    genero: 'Femenino',
    fechaNacimiento: '',
    edad: '-- años',
    ordenHijo: '',
    calle: '',
    numeroCasa: '',
    comunidad: '',
    esIndigena: false,
    etnia: '',
    etniaLabel: '',
    gruposSeleccionados: [],
    vacunasSeleccionadas: [],
    alergiasSeleccionadas: [], // <-- AÑADIDO
};

// 3. Creamos el Store
export const useRegistroStore = create<RegistroState>((set) => ({
    ...initialState,

    updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

    toggleGrupo: (grupo) => set((state) => {
        const existe = state.gruposSeleccionados.includes(grupo);
        return {
            gruposSeleccionados: existe
                ? state.gruposSeleccionados.filter((g) => g !== grupo)
                : [...state.gruposSeleccionados, grupo]
        };
    }),

    // --- NUEVAS ACCIONES PARA VACUNAS ---
    addVacuna: (vacuna) => set((state) => {
        // Validación: No agregar la misma dosis de la misma vacuna dos veces
        const existe = state.vacunasSeleccionadas.some(
            (v) => v.biologico_id === vacuna.biologico_id && v.dosis_id === vacuna.dosis_id
        );
        if (existe) return state;

        return { vacunasSeleccionadas: [...state.vacunasSeleccionadas, vacuna] };
    }),

    removeVacuna: (biologico_id, dosis_id) => set((state) => ({
        vacunasSeleccionadas: state.vacunasSeleccionadas.filter(
            (v) => !(v.biologico_id === biologico_id && v.dosis_id === dosis_id)
        )
    })),

    clearFormData: () => set(initialState),
}));