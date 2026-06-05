import { useState } from 'react';
import { apiFetch } from './useApi';

export function useNotificaciones() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviarComprobante = async (pacienteId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/notificaciones/comprobante', {
        method: 'POST',
        body: JSON.stringify({ paciente_id: pacienteId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al enviar comprobante');
      }
      return true;
    } catch (e: any) {
      setError(e.message);
      console.error('Error enviando notificación:', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { enviarComprobante, loading, error };
}
