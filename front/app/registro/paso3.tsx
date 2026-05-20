import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, FlatList, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistroStore } from '../../store/registroStore';
import { useBiologicos } from '../../hooks/useBiologicos';
import { useSubmitPaciente } from '../../hooks/useSubmitPaciente';
import ConfirmacionFormulario from '../../components/ConfirmacionFormulario';

export default function Paso3() {
    const router = useRouter();
    const {
        vacunasSeleccionadas,
        addVacuna,
        removeVacuna,
        tieneAlergia,
        alergiasSeleccionadas,
        addAlergia,
        removeAlergia,
        updateField,
        clearFormData
    } = useRegistroStore();

    const { biologicos, loading, fetchBiologicos } = useBiologicos();
    const { submitPaciente, submitState, submitError, resetSubmitState } = useSubmitPaciente();

    // Estados para el Modal de Vacunas
    const [selectedBioId, setSelectedBioId] = useState<number | null>(null);
    const [selectedDosisId, setSelectedDosisId] = useState<number | null>(null);
    const [isVacunaDropdownVisible, setIsVacunaDropdownVisible] = useState(false);

    // Estado para el Modal de Alergias
    const [isAlergiaDropdownVisible, setIsAlergiaDropdownVisible] = useState(false);

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

    const handleCerrarModalExito = () => {
        resetSubmitState();
        clearFormData();
        router.replace('/'); // Volvemos a la pantalla de inicio
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <ScrollView className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile mt-stack-lg">

                <View className="space-y-stack-lg pb-stack-lg gap-6">

                    <View className="pb-stack-xl">

                        {/* --- BLOQUE 1: VACUNAS --- */}
                        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-6">
                            <View className="flex flex-row items-center mb-stack-md">
                                <MaterialIcons name="vaccines" size={24} className="text-primary mr-2" color="#008080" />
                                <Text className="font-headline-sm text-headline-sm text-on-surface">Registro de Biológicos</Text>
                            </View>

                            <View className="bg-surface-container-low p-gutter rounded-lg border border-surface-container-highest mb-stack-md gap-4">
                                <View className="flex flex-col gap-2">
                                    <Text className="font-label-lg text-label-lg text-on-surface">Tipo de Biológico</Text>

                                    <TouchableOpacity
                                        onPress={() => setIsVacunaDropdownVisible(true)}
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
                        </View>

                        {/* --- BLOQUE 2: ALERGIAS --- */}
                        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mt-stack-md">
                            <View className="flex flex-row items-center mb-stack-md">
                                <MaterialIcons name="medical-information" size={24} className="text-error mr-2" color="#B3261E" />
                                <Text className="font-headline-sm text-headline-sm text-on-surface">Alergias</Text>
                            </View>

                            {/* Switch de Alergias */}
                            <View className="flex flex-row items-center justify-between py-2 border-b border-outline-variant pb-4 mb-4">
                                <View className="flex-1 pr-4">
                                    <Text className="font-label-lg text-on-surface">¿Es alérgico a algún biológico?</Text>
                                    <Text className="text-on-surface-variant text-sm">Active si ha presentado reacciones adversas</Text>
                                </View>
                                <Switch
                                    value={tieneAlergia}
                                    onValueChange={(value) => {
                                        updateField('tieneAlergia', value);
                                        // Si lo desactiva, opcionalmente podrías limpiar la lista de alergias
                                    }}
                                    trackColor={{ false: "#D1D5DB", true: "#B3261E" }}
                                    thumbColor={tieneAlergia ? "#FFFFFF" : "#F3F4F6"}
                                />
                            </View>

                            {/* Mostrar opciones de alergia solo si el switch está encendido */}
                            {tieneAlergia && (
                                <View className="flex flex-col gap-4">
                                    <TouchableOpacity
                                        onPress={() => setIsAlergiaDropdownVisible(true)}
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
                        </View>

                        {/* --- MODAL PARA SELECCIONAR VACUNAS --- */}
                        <Modal visible={isVacunaDropdownVisible} transparent={true} animationType="fade">
                            <TouchableOpacity
                                className="flex-1 bg-black/50 justify-center items-center p-4"
                                activeOpacity={1}
                                onPress={() => setIsVacunaDropdownVisible(false)}
                            >
                                <View className="bg-surface w-full max-h-[70%] rounded-xl overflow-hidden p-4">
                                    <Text className="font-headline-sm text-on-surface mb-4">Seleccione Biológico a Aplicar</Text>
                                    <FlatList
                                        data={biologicos}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                className="p-4 border-b border-surface-container-highest"
                                                onPress={() => {
                                                    setSelectedBioId(item.id);
                                                    setSelectedDosisId(null);
                                                    setIsVacunaDropdownVisible(false);
                                                }}
                                            >
                                                <Text className="font-body-lg text-on-surface">{item.nombre}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>

                        {/* --- MODAL PARA SELECCIONAR ALERGIAS --- */}
                        <Modal visible={isAlergiaDropdownVisible} transparent={true} animationType="fade">
                            <TouchableOpacity
                                className="flex-1 bg-black/50 justify-center items-center p-4"
                                activeOpacity={1}
                                onPress={() => setIsAlergiaDropdownVisible(false)}
                            >
                                <View className="bg-surface w-full max-h-[70%] rounded-xl overflow-hidden p-4">
                                    <Text className="font-headline-sm text-error mb-4">Seleccione Biológico (Alergia)</Text>
                                    <FlatList
                                        data={biologicos}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                className="p-4 border-b border-surface-container-highest"
                                                onPress={() => {
                                                    addAlergia({ biologico_id: item.id, nombre: item.nombre });
                                                    setIsAlergiaDropdownVisible(false);
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

                    {/* Botones de acción */}
                    <View className="w-full pt-4 pb-8 flex flex-row gap-4">
                        <TouchableOpacity onPress={() => router.back()} className="flex-1 h-touch-target-min bg-surface-container-lowest border border-outline rounded-lg flex items-center justify-center">
                            <Text className="text-on-surface font-label-lg text-label-lg uppercase tracking-wide">Atrás</Text>
                        </TouchableOpacity>

                        {/* 3. CAMBIAMOS EL ONPRESS PARA QUE USE EL HOOK */}
                        <TouchableOpacity
                            onPress={submitPaciente}
                            disabled={submitState === 'loading'}
                            className="flex-1 h-touch-target-min bg-primary rounded-lg flex items-center justify-center"
                        >
                            <Text className="text-on-primary font-label-lg text-label-lg uppercase tracking-wide">
                                Finalizar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* 4. INSERTAMOS EL MODAL DE CONFIRMACIÓN AL FINAL */}
                <ConfirmacionFormulario
                    visible={submitState !== 'idle'}
                    estado={submitState}
                    mensajeError={submitError}
                    onClose={resetSubmitState}
                    onSuccessAccept={handleCerrarModalExito}
                />
            </ScrollView>
        </SafeAreaView >
    );
}