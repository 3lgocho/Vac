// components/PacienteCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';

interface PacienteCardProps {
    nombre: string;
    apellido: string;
    cedula: string;
    vacuna: string;
    dosis: string;
    esAtrasada: boolean;
    onPress: () => void;
}

export const PacienteCard = ({ nombre, apellido, cedula, vacuna, dosis, esAtrasada, onPress }: PacienteCardProps) => {

    // Obtenemos las iniciales de forma segura. Si vienen undefined, usamos un string vacío ''
    const iniciales = `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();

    return (
        <View className="flex flex-col gap-4 mb-3">
            <TouchableOpacity onPress={onPress} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-row items-center justify-between relative overflow-hidden">
                <View className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></View>
                <View className="flex flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                        <Text className="text-on-secondary-fixed font-label-lg text-label-lg">{iniciales}</Text>
                    </View>
                    <View>
                        <Text className="font-label-lg text-label-lg text-on-surface font-bold text-base">{nombre} {apellido}</Text>
                        <Text className="font-body-md text-body-md text-on-surface-variant text-sm">{cedula}</Text>
                    </View>
                </View>
                {/* Status a la derecha */}
                <View className="items-end">
                    <View className="flex flex-row items-center gap-1 bg-primary-fixed/20 px-2 py-1 rounded-lg">
                        <Text className="font-label-md text-label-md text-primary">{vacuna}</Text>
                    </View>
                    <Text className="font-body-md text-body-md text-outline text-xs mt-1">{dosis}</Text>
                    {esAtrasada && <Text className="text-red-500 text-[10px] font-bold mt-1">ATRASADA</Text>}
                </View>
            </TouchableOpacity>
        </View>
    );
};