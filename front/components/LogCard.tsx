import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuditLog } from '../hooks/useLogs';

interface LogCardProps {
    log: AuditLog;
}

function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getActionStyle(accion: string) {
    switch (accion) {
        case 'VACUNACION':
            return {
                icon: 'vaccines' as const,
                color: '#115E59',
                bg: 'bg-secondary-fixed/30',
                border: 'border-secondary-fixed',
                labelColor: 'text-primary'
            };
        case 'REGISTRO':
            return {
                icon: 'person-add' as const,
                color: '#059669',
                bg: 'bg-success/20',
                border: 'border-success',
                labelColor: 'text-success'
            };
        case 'EDICION':
            return {
                icon: 'edit' as const,
                color: '#B45309',
                bg: 'bg-[#FEF3C7]',
                border: 'border-[#F59E0B]',
                labelColor: 'text-[#D97706]'
            };
        case 'ELIMINACION':
            return {
                icon: 'delete' as const,
                color: '#DC2626',
                bg: 'bg-error/10',
                border: 'border-error',
                labelColor: 'text-error'
            };
        default:
            return {
                icon: 'info' as const,
                color: '#4B5563',
                bg: 'bg-surface-container-high',
                border: 'border-outline-variant',
                labelColor: 'text-on-surface-variant'
            };
    }
}

export const LogCard = ({ log }: LogCardProps) => {
    const style = getActionStyle(log.accion);

    return (
        <View className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-4 relative overflow-hidden mb-3 flex flex-col`}>
            {/* Borde lateral izquierdo coloreado según la acción */}
            <View className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg.replace('/30', '').replace('/20', '').replace('/10', '')}`}></View>

            <View className="flex flex-row justify-between items-start mb-2">
                <View className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg ${style.bg}`}>
                    <MaterialIcons name={style.icon} size={18} color={style.color} />
                    <Text className={`font-label-md text-label-md ${style.labelColor}`}>
                        {log.accion}
                    </Text>
                </View>
                <Text className="font-body-sm text-body-sm text-on-surface-variant">
                    {formatDateTime(log.creado_en)}
                </Text>
            </View>

            <View className="mt-1">
                <Text className="font-body-md text-body-md text-on-surface leading-5">
                    {log.detalles}
                </Text>
            </View>

            <View className="mt-3 flex flex-row items-center justify-between border-t border-outline-variant pt-2">
                <View className="flex flex-row items-center gap-2">
                    <MaterialIcons name="badge" size={16} color="#6B7280" />
                    <Text className="font-label-sm text-label-sm text-on-surface-variant">
                        {log.nombre_personal || 'Sistema'}
                    </Text>
                </View>
                <Text className="font-label-sm text-label-sm text-outline">
                    {log.entidad_tipo} {log.entidad_id ? `#${log.entidad_id}` : ''}
                </Text>
            </View>
        </View>
    );
};
