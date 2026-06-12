import { useState, useRef } from 'react';
import { apiFetch } from './useApi';

export type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function useSubmitVacunas(pacienteId: number) {
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState('');
  
  // Generamos la llave de idempotencia una sola vez por render/intento
  const idempotencyKeyRef = useRef<string>(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

  const submit = async (vacunas: { biologico_id: number; dosis_id: number }[]) => {
    setState('loading');
    setError('');

    try {
      const res = await apiFetch(`/pacientes/${pacienteId}/vacunas`, {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKeyRef.current,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vacunas),
      });

      if (res.ok) {
        setState('success');
        // Renovamos la llave en caso de éxito por si se vuelve a usar el modal sin recargar
        idempotencyKeyRef.current = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      } else {
        const text = await res.text();
        setError(text || `Error ${res.status}`);
        setState('error');
      }
    } catch (e: any) {
      setError(e.message || 'Error de red');
      setState('error');
    }
  };

  const reset = () => setState('idle');

  return { state, error, submit, reset };
}
