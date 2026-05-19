// front/store/registroStore.ts
import { create } from 'zustand';

export interface VacunaSeleccionada {
    biologico_id: number;
    nombre: string;
    dosis_id: number;
    nombre_dosis: string;
}

export interface AlergiaSeleccionada {
    biologico_id: number;
    nombre: string;
}

interface RegistroState {
    tipoDoc: string;
    cedula: string;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    genero: string;

    fechaNacimiento: string;
    edad: string;
    ordenHijo: string;
    calle: string;
    numeroCasa: string;
    comunidad: string;
    esIndigena: boolean;
    etnia: string;
    etniaLabel: string;

    gruposSeleccionados: string[];
    vacunasSeleccionadas: VacunaSeleccionada[];
    tieneAlergia: boolean;
    alergiasSeleccionadas: AlergiaSeleccionada[];

    updateField: (field: keyof Omit<RegistroState, 'updateField' | 'toggleGrupo' | 'clearFormData' | 'addVacuna' | 'removeVacuna' | 'addAlergia' | 'removeAlergia'>, value: any) => void;
    toggleGrupo: (grupo: string) => void;

    addVacuna: (vacuna: VacunaSeleccionada) => void;
    removeVacuna: (biologico_id: number, dosis_id: number) => void;

    addAlergia: (alergia: AlergiaSeleccionada) => void;
    removeAlergia: (biologico_id: number) => void;

    clearFormData: () => void;
}

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
    tieneAlergia: false,
    alergiasSeleccionadas: [],
};

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

    addVacuna: (vacuna) => set((state) => {
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

    addAlergia: (alergia) => set((state) => {
        const existe = state.alergiasSeleccionadas.some((a) => a.biologico_id === alergia.biologico_id);
        if (existe) return state;
        return { alergiasSeleccionadas: [...state.alergiasSeleccionadas, alergia] };
    }),

    removeAlergia: (biologico_id) => set((state) => ({
        alergiasSeleccionadas: state.alergiasSeleccionadas.filter((a) => a.biologico_id !== biologico_id)
    })),

    clearFormData: () => set(initialState),
}));