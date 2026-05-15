import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Paso3() {
    const router = useRouter();

    return (
        <SafeAreaView className="bg-background flex-1">
            {/* Header */}
            <View className="bg-surface-container-lowest border-b border-surface-container-highest h-16 flex flex-row items-center px-4 w-full z-50">
                <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 flex items-center justify-center">
                    <MaterialIcons name="arrow-back" size={24} className="text-primary" color="#008080" />
                </TouchableOpacity>
                <Text className="ml-2 font-headline-sm text-headline-sm text-primary font-bold tracking-tight">Registro de Vacunación</Text>
            </View>

            <ScrollView className="flex-1 w-full max-w-2xl mx-auto px-margin-mobile mt-stack-lg">
                {/* Progress Bar */}
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
                    {/* Special Groups Section */}
                    <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter">
                        <View className="flex flex-row items-center mb-stack-md">
                            <MaterialIcons name="group" size={24} className="text-primary mr-2" color="#008080" />
                            <Text className="font-headline-sm text-headline-sm text-on-surface">Grupos Especiales</Text>
                        </View>
                        <View className="flex flex-col space-y-stack-sm gap-2">
                            <TouchableOpacity className="flex flex-row items-center min-h-[48px] p-2 rounded-lg bg-surface-container-low">
                                <View className="w-5 h-5 border border-primary bg-primary rounded flex items-center justify-center" />
                                <Text className="ml-3 font-body-md text-body-md text-on-surface">Enfermos crónicos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex flex-row items-center min-h-[48px] p-2 rounded-lg">
                                <View className="w-5 h-5 border border-outline-variant rounded" />
                                <Text className="ml-3 font-body-md text-body-md text-on-surface">Embarazadas</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Biologicals Builder Section */}
                    <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter">
                        <View className="flex flex-row items-center mb-stack-md">
                            <MaterialIcons name="vaccines" size={24} className="text-primary mr-2" color="#008080" />
                            <Text className="font-headline-sm text-headline-sm text-on-surface">Registro de Biológicos</Text>
                        </View>

                        <View className="bg-surface-container-low p-gutter rounded-lg border border-surface-container-highest mb-stack-md gap-4">
                            <View className="flex flex-col gap-2">
                                <Text className="font-label-lg text-label-lg text-on-surface">Tipo de Biológico</Text>
                                <View className="w-full min-h-[48px] bg-surface-container-lowest border border-outline-variant rounded-lg px-4 justify-center">
                                    <Text className="font-body-md text-body-md text-on-surface">Seleccione un biológico...</Text>
                                    <MaterialIcons name="arrow-drop-down" size={24} className="absolute right-3 text-on-surface-variant" color="#4B5563" />
                                </View>
                            </View>

                            <View className="flex flex-col gap-2">
                                <Text className="font-label-lg text-label-lg text-on-surface">Dosis</Text>
                                <View className="flex flex-row flex-wrap gap-2">
                                    <TouchableOpacity className="min-h-[48px] px-4 py-2 justify-center rounded-full border border-outline-variant bg-surface-container-lowest">
                                        <Text className="text-on-surface font-label-md text-label-md">1D</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="min-h-[48px] px-4 py-2 justify-center rounded-full border border-primary bg-primary-container">
                                        <Text className="text-on-primary-container font-label-md text-label-md">2D</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity className="w-full min-h-[48px] bg-secondary-container rounded-lg flex flex-row items-center justify-center mt-stack-md">
                                <MaterialIcons name="add" size={24} className="text-on-secondary-container mr-2" color="#115E59" />
                                <Text className="text-on-secondary-container font-label-lg text-label-lg uppercase tracking-wide">Añadir Vacuna</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Added Vaccines List */}
                        <View className="gap-2">
                            <Text className="font-label-lg text-label-lg text-on-surface-variant mb-2">Biológicos Añadidos</Text>

                            <View className="flex flex-row items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg p-3 border-l-4 border-l-primary">
                                <View className="flex flex-col">
                                    <Text className="font-label-lg text-label-lg text-on-surface">SRP</Text>
                                    <Text className="font-body-md text-body-md text-on-surface-variant">Dosis: 1D</Text>
                                </View>
                                <TouchableOpacity className="w-10 h-10 flex items-center justify-center rounded-full">
                                    <MaterialIcons name="delete" size={24} className="text-error" color="#DC2626" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom Action Bar */}
                <View className="w-full pt-4 pb-8 flex flex-row gap-4">
                    <TouchableOpacity onPress={() => router.back()} className="flex-1 h-touch-target-min bg-surface-container-lowest border border-outline rounded-lg flex items-center justify-center">
                        <Text className="text-on-surface font-label-lg text-label-lg uppercase tracking-wide">Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className="flex-1 h-touch-target-min bg-primary rounded-lg flex items-center justify-center">
                        <Text className="text-on-primary font-label-lg text-label-lg uppercase tracking-wide">Finalizar Registro</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}