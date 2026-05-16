import { create } from 'zustand';

// 1. Definimos todos los campos de tu formulario
interface RegistroState {
    // --- Paso 1 ---
    tipoDoc: string;
    cedula: string;
    nombre: string;    // <-- Agregar
    apellido: string;  // <-- Agregar
    genero: string;

    // --- Paso 2 ---
    fechaNacimiento: string;
    edad: string;
    calle: string;
    numeroCasa: string;
    comunidad: string;  // <-- Agregar
    esIndigena: boolean;
    etnia: string;
    etniaLabel: string;
    // --- Paso 3 ---
    gruposSeleccionados: string[];

    // --- ACCIONES ---
    // Esta función mágica actualiza CUALQUIER campo pasándole el nombre y el valor
    updateField: (field: keyof Omit<RegistroState, 'updateField' | 'toggleGrupo' | 'clearFormData'>, value: any) => void;

    // Función específica para la lógica de selección múltiple del Paso 3
    toggleGrupo: (grupo: string) => void;

    // Limpieza
    clearFormData: () => void;
}

// 2. Separamos el estado inicial para poder resetearlo fácilmente
const initialState = {
    tipoDoc: 'V',
    cedula: '',
    nombre: '',
    apellido: '',
    genero: 'Femenino',
    fechaNacimiento: '',
    edad: '-- años',
    calle: '',
    numeroCasa: '',
    comunidad: '',
    esIndigena: false,
    etnia: '',
    etniaLabel: '',
    // --- Paso 3 ---
    gruposSeleccionados: [],
};

// 3. Creamos el Store
export const useRegistroStore = create<RegistroState>((set) => ({
    ...initialState,

    // Esta única función reemplaza a decenas de "setDatos"
    updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

    // Mueve la lógica del toggle del Paso 3 directo a la memoria
    toggleGrupo: (grupo) => set((state) => {
        const existe = state.gruposSeleccionados.includes(grupo);
        return {
            gruposSeleccionados: existe
                ? state.gruposSeleccionados.filter((g) => g !== grupo)
                : [...state.gruposSeleccionados, grupo]
        };
    }),

    // Limpia todo volviendo al estado inicial
    clearFormData: () => set(initialState),
}));