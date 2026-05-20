// front/components/registro/SeccionVacunas.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistroStore } from '../../store/registroStore';
import { Biologico } from '../../hooks/useBiologicos';
import BiologicosModal from './modales/BiologicosModal';

interface Props {
    biologicos: Biologico[];
    loading: boolean;
}

export default function SeccionVacunas({ biologicos, loading }: Props) {
    const { vacunasSeleccionadas, addVacuna, removeVacuna } = useRegistroStore();

    const [selectedBioId, setSelectedBioId] = useState<number | null>(null);
    const [selectedDosisId, setSelectedDosisId] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const activeBiologico = biologicos.find(b => b.id === selectedBioId);

    const handleAddVacuna = () => {
        if (!activeBiologico || !selectedDosisId) return;
        const activeDosis = activeBiologico.dosis.find(d => d.id === selectedDosisId);
        if (!activeDosis) return;

        addVacuna({
            biologico_id: activeBiologico.id,
            nombre: activeBiologico.nombre,
            dosis_id: activeDosis.id,
            nombre_dosis: activeDosis.nombre_dosis
        });

        setSelectedBioId(null);
        setSelectedDosisId(null);
    };

    return (
        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-6">
            <View className="flex flex-row items-center mb-stack-md">
                <MaterialIcons name="vaccines" size={24} className="text-primary mr-2" color="#008080" />
                <Text className="font-headline-sm text-headline-sm text-on-surface">Registro de Biológicos</Text>
            </View>

            <View className="bg-surface-container-low p-gutter rounded-lg border border-surface-container-highest mb-stack-md gap-4">
                <View className="flex flex-col gap-2">
                    <Text className="font-label-lg text-label-lg text-on-surface">Tipo de Biológico</Text>
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(true)}
                        disabled={loading}
                        className="w-full min-h-[48px] bg-surface-container-lowest border border-outline-variant rounded-lg px-4 flex-row items-center justify-between"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#008080" />
                        ) : (
                            <Text className={`font-body-md text-body-md ${activeBiologico ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                {activeBiologico ? activeBiologico.nombre : 'Seleccione un biológico...'}
                            </Text>
                        )}
                        <MaterialIcons name="arrow-drop-down" size={24} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                <View className="flex flex-col gap-2">
                    <Text className="font-label-lg text-label-lg text-on-surface">Dosis</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {!activeBiologico ? (
                            <Text className="text-on-surface-variant font-body-sm italic">Seleccione un biológico primero</Text>
                        ) : (
                            activeBiologico.dosis.map((dosis) => {
                                const isSelected = selectedDosisId === dosis.id;
                                return (
                                    <TouchableOpacity
                                        key={dosis.id}
                                        onPress={() => setSelectedDosisId(dosis.id)}
                                        className={`min-h-[48px] px-4 py-2 justify-center rounded-full border ${isSelected ? 'border-primary bg-primary-container' : 'border-outline-variant bg-surface-container-lowest'}`}
                                    >
                                        <Text className={`font-label-md text-label-md ${isSelected ? 'text-on-primary-container' : 'text-on-surface'}`}>
                                            {dosis.nombre_dosis}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleAddVacuna}
                    disabled={!activeBiologico || !selectedDosisId}
                    className={`w-full min-h-[48px] rounded-lg flex flex-row items-center justify-center mt-stack-md ${activeBiologico && selectedDosisId ? 'bg-secondary-container' : 'bg-surface-container-highest opacity-50'}`}
                >
                    <MaterialIcons name="add" size={24} color={activeBiologico && selectedDosisId ? "#115E59" : "#4B5563"} className="mr-2" />
                    <Text className={`font-label-lg text-label-lg uppercase tracking-wide ${activeBiologico && selectedDosisId ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                        Añadir Vacuna
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="gap-2">
                <Text className="font-label-lg text-label-lg text-on-surface-variant mb-2">Biológicos Añadidos</Text>
                {vacunasSeleccionadas.length === 0 ? (
                    <Text className="text-on-surface-variant text-center py-4 font-body-md">No se han añadido biológicos</Text>
                ) : (
                    vacunasSeleccionadas.map((vacuna, index) => (
                        <View key={`${vacuna.biologico_id}-${vacuna.dosis_id}-${index}`} className="flex flex-row items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg p-3 border-l-4 border-l-primary mb-2">
                            <View className="flex flex-col">
                                <Text className="font-label-lg text-label-lg text-on-surface">{vacuna.nombre}</Text>
                                <Text className="font-body-md text-body-md text-on-surface-variant">Dosis: {vacuna.nombre_dosis}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => removeVacuna(vacuna.biologico_id, vacuna.dosis_id)}
                                className="w-10 h-10 flex items-center justify-center rounded-full"
                            >
                                <MaterialIcons name="delete" size={24} className="text-error" color="#DC2626" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>

            <BiologicosModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                biologicos={biologicos}
                titulo="Seleccione Biológico a Aplicar"
                onSelect={(item) => {
                    setSelectedBioId(item.id);
                    setSelectedDosisId(null);
                    setIsModalVisible(false);
                }}
            />
        </View>
    );
}