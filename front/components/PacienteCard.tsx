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
        <TouchableOpacity
            onPress={onPress}
            className={`p-4 rounded-xl flex-row items-center mb-3 ${esAtrasada ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'}`}
        >
            {/* Avatar con inicial */}
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold text-lg">{iniciales}</Text>
            </View>

            {/* Info Principal */}
            <View className="flex-1">
                {/* Concatenamos para mostrar el nombre completo */}
                <Text className="font-bold text-base">{nombre} {apellido}</Text>
                <Text className="text-gray-500 text-sm">{cedula}</Text>
            </View>

            {/* Status a la derecha */}
            <View className="items-end">
                <Text className="font-semibold text-sm">{vacuna}</Text>
                <Text className="text-xs text-gray-400">{dosis}</Text>
                {esAtrasada && <Text className="text-red-500 text-[10px] font-bold mt-1">ATRASADA</Text>}
            </View>
        </TouchableOpacity>
    );
};