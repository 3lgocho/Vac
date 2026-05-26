// components/PacienteCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PacienteCardProps {
    nombre: string;
    apellido: string;
    cedula: string;
    nextVaccine?: {
        nombre_vacuna: string;
        dosis_a_aplicar: string;
        estado: string;
    } | null;
    onPress: () => void;
}

export const PacienteCard = ({ nombre, apellido, cedula, nextVaccine, onPress }: PacienteCardProps) => {

    const iniciales = `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();

    const estadoColor = () => {
        if (!nextVaccine) return 'bg-surface-container-high';
        switch (nextVaccine.estado) {
            case 'Al día': return 'bg-success/20';
            case 'Atrasada': return 'bg-error/20';
            case 'Para Hoy': return 'bg-tertiary/20';
            case 'Sin vacunas': return 'bg-surface-container-high';
            default: return 'bg-primary-fixed/20';
        }
    };

    const iconoEstado = () => {
        if (!nextVaccine) return 'help-outline';
        switch (nextVaccine.estado) {
            case 'Al día': return 'check-circle';
            case 'Atrasada': return 'warning';
            case 'Para Hoy': return 'today';
            case 'Sin vacunas': return 'block';
            default: return 'vaccines';
        }
    };

    return (
        <View className="flex flex-col gap-4 mb-3">
            <TouchableOpacity onPress={onPress} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-row items-center justify-between relative overflow-hidden">
                <View className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></View>
                <View className="flex flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                        <Text className="text-on-secondary-fixed font-label-lg text-label-lg">{iniciales}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-label-lg text-label-lg text-on-surface font-bold text-base" numberOfLines={1}>{nombre} {apellido}</Text>
                        <Text className="font-body-md text-body-md text-on-surface-variant text-sm">{cedula}</Text>
                    </View>
                </View>
                <View className="items-end ml-2">
                    <View className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg ${estadoColor()}`}>
                        <MaterialIcons name={iconoEstado()} size={18} className="text-primary" />
                        <Text className="font-label-md text-label-md text-primary" numberOfLines={1}>
                            {nextVaccine ? `${nextVaccine.nombre_vacuna} ${nextVaccine.dosis_a_aplicar}` : '—'}
                        </Text>
                    </View>
                    {nextVaccine?.estado === 'Atrasada' && (
                        <Text className="text-error text-[10px] font-bold mt-1">ATRASADA</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};