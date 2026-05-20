// front/components/registro/SeccionEtnia.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistroStore } from '../../store/registroStore';
import EtniaSearchModal from './modales/EtniaSearchModal';

export default function SeccionEtnia() {
    const { esIndigena, etnia, etniaLabel, updateField } = useRegistroStore();
    const [isListOpen, setIsListOpen] = useState(false);

    const handleSelectEtnia = (valor: string, etiqueta: string) => {
        updateField('etnia', valor);
        updateField('etniaLabel', etiqueta);
        setIsListOpen(false);
    };

    return (
        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg z-10">
            <Text className="font-headline-sm text-on-surface mb-stack-md">Etnia</Text>

            {!esIndigena && (
                <View className="flex flex-col gap-stack-sm mb-6">
                    <Text className="font-label-lg text-on-surface-variant mb-2">Seleccione una opción</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {['Blanco o Criollo', 'Afrodescendiente', 'Mestizo', 'Otro'].map((opcion) => (
                            <TouchableOpacity
                                key={opcion}
                                onPress={() => updateField('etnia', opcion)}
                                className={`h-touch-target-min px-4 flex items-center justify-center rounded-full border ${etnia === opcion
                                    ? 'border-primary bg-primary-container'
                                    : 'border-outline-variant bg-surface-container-lowest'
                                    }`}
                            >
                                <Text className={`font-body-md ${etnia === opcion ? 'text-on-primary font-bold' : 'text-on-surface'}`}>
                                    {opcion}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Switch Grupo Indígena */}
            <View className="flex flex-row items-center justify-between py-2 border-t border-outline-variant pt-4">
                <View className="flex-1 pr-4">
                    <Text className="font-label-lg text-on-surface">¿Pertenece a un grupo indígena?</Text>
                    <Text className="text-on-surface-variant text-sm">Active esta opción si aplica</Text>
                </View>
                <Switch
                    value={esIndigena}
                    onValueChange={(value: boolean) => {
                        updateField('esIndigena', value);
                        if (!value) {
                            updateField('etnia', '');
                            updateField('etniaLabel', '');
                        }
                    }}
                    trackColor={{ false: "#D1D5DB", true: "#008080" }}
                    thumbColor={esIndigena ? "#FFFFFF" : "#F3F4F6"}
                />
            </View>

            {esIndigena && (
                <View className="mt-4">
                    <Text className="font-label-md text-on-surface mb-1">Grupo Indígena Seleccionado</Text>
                    <TouchableOpacity
                        onPress={() => setIsListOpen(true)}
                        className="flex flex-row items-center justify-between border border-outline-variant rounded-lg bg-surface-container-low px-3 h-12"
                    >
                        <Text className={`font-body-md ${etniaLabel ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                            {etniaLabel || "Toque para buscar y seleccionar..."}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            )}

            <EtniaSearchModal
                visible={isListOpen}
                onClose={() => setIsListOpen(false)}
                onSelect={handleSelectEtnia}
            />
        </View>
    );
}