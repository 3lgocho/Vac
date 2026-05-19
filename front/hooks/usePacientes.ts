import { useState, useCallback } from 'react';

// CAMBIA ESTO por la IP de tu PC o 10.0.2.2 si es emulador Android
const API_URL = 'http://localhost:3000/pacientes';

export const usePacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // GET: Obtener todos los pacientes
    const fetchPacientes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al obtener pacientes');

            const data = await response.json();
            setPacientes(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // POST: Crear un nuevo paciente
    const createPaciente = async (pacienteData: any) => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pacienteData),
            });

            if (!response.ok) throw new Error('Error al guardar el paciente');

            // Refrescamos la lista después de guardar
            await fetchPacientes();
            setError(null);
            return true; // Éxito
        } catch (err: any) {
            setError(err.message);
            return false; // Fallo
        } finally {
            setLoading(false);
        }
    };

    return {
        pacientes,
        loading,
        error,
        fetchPacientes,
        createPaciente,
    };
};