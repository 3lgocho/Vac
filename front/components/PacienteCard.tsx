import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PacienteCardProps {
    nombre: string;
    apellido: string;
    cedula: string;
    nextVaccine?: {
        estado: string;
        proxima_vacuna: string | null;
        proxima_dosis: string | null;
        proxima_fecha: string | null;
        vacunas_atrasadas: string[];
    } | null;
    onPress: () => void;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    if (diff === -1) return 'Ayer';
    if (diff > 0 && diff <= 7) return `En ${diff} días`;
    if (diff < 0 && diff >= -7) return `Hace ${Math.abs(diff)} días`;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const PacienteCard = ({ nombre, apellido, cedula, nextVaccine, onPress }: PacienteCardProps) => {

    const iniciales = `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();

    const estado = nextVaccine?.estado ?? null;
    const tieneProxima = nextVaccine?.proxima_vacuna && nextVaccine?.proxima_dosis;
    const tieneAtrasadas = nextVaccine?.vacunas_atrasadas && nextVaccine.vacunas_atrasadas.length > 0;

    return (
        <TouchableOpacity
            onPress={onPress}
            // Eliminamos el flex-row de aquí y dejamos que apile en columna. Se añade mb-3 para separar las tarjetas.
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 relative overflow-hidden mb-3 flex flex-col"
        >
            {/* Borde lateral izquierdo */}
            <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></View>

            {/* Fila Principal: Datos del paciente y estado */}
            <View className="flex flex-row items-center justify-between w-full">
                <View className="flex flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                        <Text className="text-on-secondary-fixed font-label-lg text-label-lg">{iniciales}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-label-lg text-label-lg text-on-surface font-bold text-base" numberOfLines={1}>{nombre} {apellido}</Text>
                        <Text className="font-body-md text-body-md text-on-surface-variant text-sm">{cedula}</Text>
                    </View>
                </View>
                <View className="items-end ml-2 max-w-[160px]">
                    {estado === 'Sin vacunas' ? (
                        <View className="flex flex-row items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-high">
                            <MaterialIcons name="block" size={24} color="#6B7280" />
                            <Text className="font-label-md text-label-md text-on-surface-variant">Sin vacunas</Text>
                        </View>
                    ) : !tieneProxima ? (
                        <View className="flex flex-row items-center gap-1 px-2 py-1 rounded-lg bg-success/20">
                            <MaterialIcons name="check-circle" size={24} color="#059669" />
                            <Text className="font-label-md text-label-md text-success">Completada</Text>
                        </View>
                    ) : (
                        <>
                            <View className="flex flex-row items-center gap-1 px-2 py-1 rounded-lg bg-secondary-fixed/20">
                                <MaterialIcons name="vaccines" size={24} color="#115E59" />
                                <Text className="font-body-medium text-body-medium text-primary font-medium text-base" numberOfLines={1}>
                                    {nextVaccine!.proxima_vacuna} {nextVaccine!.proxima_dosis}
                                </Text>
                            </View>
                            <Text className="font-body-md text-body-md text-outline text-xs mt-1">
                                Próxima dosis: {formatDate(nextVaccine!.proxima_fecha)}
                            </Text>
                        </>
                    )}
                </View>
            </View>

            {/* Fila de Advertencia: Integrada dentro del botón pero debajo del contenido principal */}
            {tieneAtrasadas && (
                <View className="bg-error/10 border border-error/20 rounded-lg px-3 py-2 flex flex-row items-center gap-2 mt-3 w-full">
                    <MaterialIcons name="warning" size={18} color="#DC2626" />
                    <Text className="font-label-md text-label-md text-error flex-1">
                        Atrasadas: {nextVaccine!.vacunas_atrasadas.join(', ')}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};