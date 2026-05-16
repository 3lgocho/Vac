import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GRUPOS_ESPECIALES } from '../../constants/grupos_especiales';
import { useRegistroStore } from '../../store/registroStore';
import { useBiologicos } from '../../hooks/useBiologicos';

export default function Paso3() {
    const router = useRouter();
    const {
        gruposSeleccionados,
        toggleGrupo,
        vacunasSeleccionadas,
        addVacuna,
        removeVacuna,
        clearFormData
    } = useRegistroStore();

    const { biologicos, loading, fetchBiologicos } = useBiologicos();
    const [selectedBioId, setSelectedBioId] = useState<number | null>(null);
    const [selectedDosisId, setSelectedDosisId] = useState<number | null>(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    useEffect(() => {
        fetchBiologicos();
    }, [fetchBiologicos]);

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
        <SafeAreaView className="bg-background flex-1">
            <ScrollView className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile mt-stack-lg">
                <View className="mb-stack-lg bg-surface-container-lowest rounded-xl border border-surface-container-highest p-gutter">
                    <View className="flex flex-row justify-between items-center mb-stack-sm">
                        <Text className="font-label-md text-label-md text-on-surface">Paso 3 de 3</Text>
                        <Text className="font-label-lg text-label-lg text-primary">Inmunización</Text>
                    </View>
                    <View className="h-2 w-full bg-secondary-fixed rounded-full overflow-hidden">
                        <View className="h-full bg-primary w-full rounded-full"></View>
                    </View>
                </View>

                <View className="space-y-stack-lg pb-stack-lg gap-6">
                    <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter">
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

                    <View className="px-gutter pb-stack-xl">
                        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter">
                            <View className="flex flex-row items-center mb-stack-md">
                                <MaterialIcons name="vaccines" size={24} className="text-primary mr-2" color="#008080" />
                                <Text className="font-headline-sm text-headline-sm text-on-surface">Registro de Biológicos</Text>
                            </View>

                            <View className="bg-surface-container-low p-gutter rounded-lg border border-surface-container-highest mb-stack-md gap-4">
                                <View className="flex flex-col gap-2">
                                    <Text className="font-label-lg text-label-lg text-on-surface">Tipo de Biológico</Text>

                                    <TouchableOpacity
                                        onPress={() => setIsDropdownVisible(true)}
                                        disabled={loading}
                                        className="w-full min-h-[48px] bg-surface-container-lowest border border-outline-variant rounded-lg px-4 justify-center flex-row items-center justify-between"
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
                        </View>

                        <Modal visible={isDropdownVisible} transparent={true} animationType="fade">
                            <TouchableOpacity
                                className="flex-1 bg-black/50 justify-center items-center p-4"
                                activeOpacity={1}
                                onPress={() => setIsDropdownVisible(false)}
                            >
                                <View className="bg-surface w-full max-h-[70%] rounded-xl overflow-hidden p-4">
                                    <Text className="font-headline-sm text-on-surface mb-4">Seleccione Biológico</Text>
                                    <FlatList
                                        data={biologicos}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                className="p-4 border-b border-surface-container-highest"
                                                onPress={() => {
                                                    setSelectedBioId(item.id);
                                                    setSelectedDosisId(null);
                                                    setIsDropdownVisible(false);
                                                }}
                                            >
                                                <Text className="font-body-lg text-on-surface">{item.nombre}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>

                    <View className="w-full pt-4 pb-8 flex flex-row gap-4">
                        <TouchableOpacity onPress={() => router.back()} className="flex-1 h-touch-target-min bg-surface-container-lowest border border-outline rounded-lg flex items-center justify-center">
                            <Text className="text-on-surface font-label-lg text-label-lg uppercase tracking-wide">Atrás</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                console.log("🚀 Payload listo para enviar al backend:", useRegistroStore.getState());
                                clearFormData();
                                router.replace('/');
                            }}
                            className="flex-1 h-touch-target-min bg-primary rounded-lg flex items-center justify-center"
                        >
                            <Text className="text-on-primary font-label-lg text-label-lg uppercase tracking-wide">Finalizar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}