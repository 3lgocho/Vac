import { useState } from 'react';

const API_BASE = 'http://localhost:3000';

export type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function useSubmitVacunas(pacienteId: number) {
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState('');

  const submit = async (vacunas: { biologico_id: number; dosis_id: number }[]) => {
    setState('loading');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/pacientes/${pacienteId}/vacunas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vacunas),
      });

      if (res.ok) {
        setState('success');
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
