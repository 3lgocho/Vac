// front/hooks/useSubmitPaciente.ts
import { useState } from 'react';
import { useRegistroStore } from '../store/registroStore';
import { SubmitState } from '../components/ConfirmacionFormulario';
import { apiFetch } from './useApi';

export const useSubmitPaciente = () => {
    // Leemos el estado global directamente aquí, sin pasarlo por props
    const estadoStore = useRegistroStore();

    // Estados para controlar el modal de confirmación
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [submitError, setSubmitError] = useState<string>('');

    const submitPaciente = async () => {
        setSubmitState('loading');
        setSubmitError('');

        // 1. Transformar la fecha (DD/MM/AAAA a YYYY-MM-DD para PostgreSQL/Rust)
        let fechaNacRust = "";
        if (estadoStore.fechaNacimiento.length === 10) {
            const [dia, mes, anio] = estadoStore.fechaNacimiento.split('/');
            fechaNacRust = `${anio}-${mes}-${dia}`;
        }

        // 2. Construir el Payload mapeado al backend (Rust)
        const payload = {
            cedula: estadoStore.cedula || "S/I",
            nacionalidad: estadoStore.tipoDoc,
            nombre: estadoStore.nombre,
            apellido: estadoStore.apellido,
            telefono: estadoStore.telefono,
            correo: estadoStore.correo || null,
            fecha_nacimiento: fechaNacRust,
            genero: estadoStore.genero,
            orden_hijo: estadoStore.ordenHijo ? parseInt(estadoStore.ordenHijo) : null,
            direccion_comunidad: estadoStore.comunidad || null,
            direccion_calle: estadoStore.calle || null,
            direccion_casa: estadoStore.numeroCasa || null,
            etnia: estadoStore.etnia || null,
            grupos_especiales: estadoStore.gruposSeleccionados,
            vacunas: estadoStore.vacunasSeleccionadas.map(v => ({
                biologico_id: v.biologico_id,
                dosis_id: v.dosis_id
            })),
            alergias: estadoStore.alergiasSeleccionadas.map(a => ({
                biologico_id: a.biologico_id
            }))
        };

        try {
            const idempotencyKey = estadoStore.getIdempotencyKey();

            const response = await apiFetch('/pacientes', {
                method: 'POST',
                headers: {
                    'Idempotency-Key': idempotencyKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSubmitState('success');
                estadoStore.clearIdempotencyKey();
            } else {
                const errorData = await response.text();
                setSubmitError(`Error del servidor: ${errorData}`);
                setSubmitState('error');
            }

        } catch (error: any) {
            console.log("Error de red detectado:", error);
            // Aquí iría el guardado en AsyncStorage más adelante
            setSubmitState('offline');
        }
    };

    const resetSubmitState = () => {
        setSubmitState('idle');
    };

    return {
        submitPaciente,
        submitState,
        submitError,
        resetSubmitState
    };
};