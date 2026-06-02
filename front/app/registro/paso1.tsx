// front/app/registro/paso1.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { useRouter } from 'expo-router';

// Importamos nuestros nuevos componentes limpios
import SeccionIdentidad from '../../components/registro/SeccionIdentidad';
import SeccionBiologica from '../../components/registro/SeccionBiologica';

export default function Paso1() {
    const router = useRouter();

    return (
        <View className="bg-background flex-1">
            <ScrollView className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile pt-2">

                <SeccionIdentidad />

                <SeccionBiologica />

                {/* Action Area */}
                <View className="mt-stack-lg mb-8 flex flex-row justify-end">
                    <TouchableOpacity
                        onPress={() => router.push('/registro/paso2')}
                        className="h-touch-target-min px-8 bg-primary rounded-lg flex flex-row items-center justify-center gap-2 w-full">
                        <Text className="text-on-primary font-label-lg text-label-lg uppercase">Siguiente</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}