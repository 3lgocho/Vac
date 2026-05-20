// front/components/registro/SeccionAlergias.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistroStore } from '../../store/registroStore';
import { Biologico } from '../../hooks/useBiologicos';
import BiologicosModal from './modales/BiologicosModal';

interface Props {
    biologicos: Biologico[];
}

export default function SeccionAlergias({ biologicos }: Props) {
    const { tieneAlergia, updateField, alergiasSeleccionadas, addAlergia, removeAlergia } = useRegistroStore();
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mt-stack-md">
            <View className="flex flex-row items-center mb-stack-md">
                <MaterialIcons name="medical-information" size={24} className="text-error mr-2" color="#B3261E" />
                <Text className="font-headline-sm text-headline-sm text-on-surface">Alergias</Text>
            </View>

            <View className="flex flex-row items-center justify-between py-2 border-b border-outline-variant pb-4 mb-4">
                <View className="flex-1 pr-4">
                    <Text className="font-label-lg text-on-surface">¿Es alérgico a algún biológico?</Text>
                    <Text className="text-on-surface-variant text-sm">Active si ha presentado reacciones adversas</Text>
                </View>
                <Switch
                    value={tieneAlergia}
                    onValueChange={(value) => updateField('tieneAlergia', value)}
                    trackColor={{ false: "#D1D5DB", true: "#B3261E" }}
                    thumbColor={tieneAlergia ? "#FFFFFF" : "#F3F4F6"}
                />
            </View>

            {tieneAlergia && (
                <View className="flex flex-col gap-4">
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        className="w-full min-h-[48px] bg-surface-container-lowest border border-error rounded-lg px-4 flex-row items-center justify-between"
                    >
                        <Text className="font-body-md text-on-surface">Toque para seleccionar biológico...</Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="#B3261E" />
                    </TouchableOpacity>

                    <View className="gap-2 mt-2">
                        <Text className="font-label-lg text-label-lg text-on-surface-variant mb-2">Alergias Registradas</Text>
                        {alergiasSeleccionadas.length === 0 ? (
                            <Text className="text-on-surface-variant text-center py-4 font-body-md">Ninguna registrada aún</Text>
                        ) : (
                            alergiasSeleccionadas.map((alergia) => (
                                <View key={`alergia-${alergia.biologico_id}`} className="flex flex-row items-center justify-between bg-error-container border border-error rounded-lg p-3 mb-2">
                                    <Text className="font-label-lg text-on-error-container flex-1">{alergia.nombre}</Text>
                                    <TouchableOpacity
                                        onPress={() => removeAlergia(alergia.biologico_id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50"
                                    >
                                        <MaterialIcons name="close" size={24} className="text-error" color="#B3261E" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            )}

            <BiologicosModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                biologicos={biologicos}
                titulo="Seleccione Biológico (Alergia)"
                tituloClassName="text-error"
                onSelect={(item) => {
                    addAlergia({ biologico_id: item.id, nombre: item.nombre });
                    setIsModalVisible(false);
                }}
            />
        </View>
    );
}