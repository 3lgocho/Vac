// front/components/registro/SeccionGruposEspeciales.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistroStore } from '../../store/registroStore';
import { GRUPOS_ESPECIALES } from '../../constants/grupos_especiales';

export default function SeccionGruposEspeciales() {
    const { gruposSeleccionados, toggleGrupo } = useRegistroStore();

    return (
        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-stack-lg">
            <View className="flex flex-row items-center mb-stack-sm">
                <MaterialIcons name="group" size={24} className="text-primary mr-2" color="#008080" />
                <Text className="font-headline-sm text-headline-sm text-on-surface">Grupos Especiales</Text>
            </View>
            <Text className="font-label-md text-on-surface-variant mb-4">Puede seleccionar más de una opción si aplica.</Text>

            <View className="flex flex-row flex-wrap justify-between gap-y-3">
                {GRUPOS_ESPECIALES.map((grupo) => {
                    const isSelected = gruposSeleccionados.includes(grupo.value);
                    return (
                        <TouchableOpacity
                            key={grupo.id}
                            onPress={() => toggleGrupo(grupo.value)}
                            activeOpacity={0.7}
                            className={`w-[48%] h-14 px-2 flex flex-row items-center justify-center rounded-xl border ${isSelected ? 'border-primary' : 'border-outline-variant'}`}
                        >
                            <MaterialIcons
                                name={isSelected ? "check-box" : "check-box-outline-blank"}
                                size={20}
                                color={isSelected ? "#008080" : "#9CA3AF"}
                                className="mr-2"
                            />
                            <Text className={`flex-1 font-body-sm text-left leading-tight ${isSelected ? "text-primary" : 'text-on-surface'}`}>
                                {grupo.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}