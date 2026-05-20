// front/app/registro/paso2.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

// Importamos nuestros nuevos componentes limpios
import SeccionDireccion from '../../components/registro/SeccionDireccion';
import SeccionEtnia from '../../components/registro/SeccionEtnia';
import SeccionGruposEspeciales from '../../components/registro/SeccionGruposEspeciales';

export default function Paso2() {
    const router = useRouter();

    return (
        <SafeAreaView className="bg-surface flex-1">
            <ScrollView
                className="w-full h-full"
                contentContainerClassName="max-w-3xl mx-auto w-full px-margin-mobile pt-stack-lg flex-grow"
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={true}
            >
                <SeccionDireccion />

                <SeccionEtnia />

                <SeccionGruposEspeciales />

                {/* Action Buttons */}
                <View className="flex flex-row gap-gutter mt-stack-lg mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="flex-1 h-touch-target-min rounded-lg bg-surface-container-lowest border border-outline flex items-center justify-center">
                        <Text className="text-on-surface font-label-lg uppercase tracking-wide">Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/registro/paso3')} className="flex-1 h-touch-target-min rounded-lg bg-primary flex items-center justify-center">
                        <Text className="text-on-primary font-label-lg uppercase tracking-wide">Siguiente</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}