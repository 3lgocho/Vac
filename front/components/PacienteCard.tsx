// components/PacienteCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';

interface PacienteCardProps {
    nombre: string;
    cedula: string;
    vacuna: string;
    dosis: string;
    esAtrasada: boolean; // El backend nos dice si la fecha es menor a hoy
    onPress: () => void;
}

export const PacienteCard = ({ nombre, cedula, vacuna, dosis, esAtrasada, onPress }: PacienteCardProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`p-4 rounded-xl flex-row items-center mb-3 ${esAtrasada ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'}`}
        >
            {/* Avatar con inicial */}
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold text-lg">{nombre[0]}</Text>
            </View>

            {/* Info Principal */}
            <View className="flex-1">
                <Text className="font-bold text-base">{nombre}</Text>
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