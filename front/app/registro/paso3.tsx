import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegistroStore } from '../../store/registroStore';
import { useBiologicos } from '../../hooks/useBiologicos';
import { useSubmitPaciente } from '../../hooks/useSubmitPaciente';
import ConfirmacionFormulario from '../../components/ConfirmacionFormulario';
import SeccionVacunas from '../../components/registro/SeccionVacunas';
import SeccionAlergias from '../../components/registro/SeccionAlergias';

export default function Paso3() {
    const router = useRouter();
    const { clearFormData } = useRegistroStore();
    const { biologicos, loading, fetchBiologicos } = useBiologicos();
    const { submitPaciente, submitState, submitError, resetSubmitState } = useSubmitPaciente();

    useEffect(() => {
        fetchBiologicos();
    }, [fetchBiologicos]);

    const handleCerrarModalExito = () => {
        resetSubmitState();
        clearFormData();
        router.replace('/');
    };

    if (loading) {
        return (
            <SafeAreaView className="bg-background flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#008080" />
                <Text className="mt-4 text-on-surface-variant font-body-md">Cargando catálogo de biológicos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-background flex-1">
            <ScrollView className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile mt-stack-lg">
                <View className="space-y-stack-lg pb-stack-lg gap-6">
                    <View className="pb-stack-xl">
                        <SeccionVacunas biologicos={biologicos} loading={loading} />
                        <SeccionAlergias biologicos={biologicos} />
                    </View>

                    <View className="w-full pt-4 pb-8 flex flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="flex-1 h-touch-target-min bg-surface-container-lowest border border-outline rounded-lg flex items-center justify-center"
                        >
                            <Text className="text-on-surface font-label-lg text-label-lg uppercase tracking-wide">Atrás</Text>
                        </TouchableOpacity>

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

                <ConfirmacionFormulario
                    visible={submitState !== 'idle'}
                    estado={submitState}
                    mensajeError={submitError}
                    onClose={resetSubmitState}
                    onSuccessAccept={handleCerrarModalExito}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
