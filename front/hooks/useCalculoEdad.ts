// front/hooks/useCalculoEdad.ts
import { useRegistroStore } from '../store/registroStore';

export const useCalculoEdad = () => {
    const { updateField } = useRegistroStore();

    const calcularEdad = (fecha: string) => {
        if (fecha.length < 10) {
            updateField('edad', '-- años');
            return;
        }

        const [dia, mes, anio] = fecha.split('/');
        const fechaNac = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        const hoy = new Date();

        if (isNaN(fechaNac.getTime()) || fechaNac > hoy) {
            updateField('edad', 'Fecha inválida');
            return;
        }

        let ageYears = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            ageYears--;
        }

        if (ageYears > 0) {
            updateField('edad', `${ageYears} años`);
        } else {
            let ageMonths = (hoy.getFullYear() - fechaNac.getFullYear()) * 12 + (hoy.getMonth() - fechaNac.getMonth());
            if (hoy.getDate() < fechaNac.getDate()) {
                ageMonths--;
            }

            if (ageMonths > 0) {
                updateField('edad', `${ageMonths} meses`);
            } else {
                updateField('edad', 'Días de nacido');
            }
        }
    };

    const handleDateChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
        }

        updateField('fechaNacimiento', formatted);
        calcularEdad(formatted);
    };

    return { handleDateChange };
};