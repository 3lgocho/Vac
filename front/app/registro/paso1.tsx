import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Paso1() {
    const router = useRouter();

    return (
        <SafeAreaView className="bg-background flex-1">
            {/* Header */}
            <View className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex flex-row items-center px-4 h-16 w-full z-50">
                <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 mr-2 flex items-center justify-center rounded-full">
                    <Text className="material-symbols-outlined text-teal-600 dark:text-teal-400">arrow_back</Text>
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-teal-600 dark:text-teal-400 text-lg mr-12">Registro de Vacunación</Text>
            </View>

            <ScrollView className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile pt-stack-lg">
                {/* Progress Indicator */}
                <View className="mb-stack-lg">
                    <View className="flex flex-row justify-between items-center mb-stack-sm">
                        <Text className="font-label-lg text-label-lg text-on-surface">Paso 1 de 3</Text>
                        <Text className="font-label-md text-label-md text-on-surface-variant">Identificación</Text>
                    </View>
                    <View className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <View className="h-full bg-primary rounded-full" style={{ width: '33.33%' }}></View>
                    </View>
                </View>

                {/* Form Card Surface */}
                <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter mb-stack-lg">
                    <Text className="font-headline-sm text-headline-sm text-on-surface mb-stack-md pb-stack-sm border-b border-outline-variant">
                        Datos de Identificación
                    </Text>

                    <View className="space-y-stack-md gap-4">
                        {/* Cédula */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Documento de Identidad</Text>
                            <View className="flex flex-row">
                                <View className="h-touch-target-min border border-outline-variant bg-surface-container-lowest justify-center px-3 rounded-l-DEFAULT w-20">
                                    <Text className="text-on-surface font-body-md text-body-md">V</Text>
                                </View>
                                <TextInput
                                    className="flex-1 h-touch-target-min border border-l-0 border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-r-DEFAULT px-4"
                                    placeholder="Ej. 12345678"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Nombre */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Nombre</Text>
                            <TextInput className="h-touch-target-min w-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT px-4" />
                        </View>

                        {/* Apellido */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Apellido</Text>
                            <TextInput className="h-touch-target-min w-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT px-4" />
                        </View>

                        {/* Gender Segmented Control (UI visual) */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Género</Text>
                            <View className="flex flex-row w-full bg-surface-container-low rounded-DEFAULT border border-outline-variant p-[2px]">
                                <TouchableOpacity className="flex-1 items-center justify-center h-touch-target-min rounded-[2px] bg-surface-container-lowest shadow-sm">
                                    <Text className="font-label-lg text-label-lg text-primary">Femenino</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 items-center justify-center h-touch-target-min rounded-[2px]">
                                    <Text className="font-label-lg text-label-lg text-on-surface-variant">Masculino</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Area */}
                <View className="mt-stack-lg mb-8 flex flex-row justify-end">
                    <TouchableOpacity
                        onPress={() => router.push('/registro/paso2')}
                        className="h-touch-target-min px-8 bg-primary rounded-full flex flex-row items-center justify-center gap-2 w-full"
                    >
                        <Text className="text-on-primary font-label-lg text-label-lg">Siguiente</Text>
                        <Text className="material-symbols-outlined text-[20px] text-on-primary">arrow_forward</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}