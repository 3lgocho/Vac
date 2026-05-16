import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { GRUPOS_ESPECIALES } from '../../constants/grupos_especiales';

export default function Paso3() {
    const router = useRouter();

    // Estado para la selección múltiple de los grupos especiales
    const [gruposSeleccionados, setGruposSeleccionados] = useState<string[]>([]);

    // Función que agrega o quita el grupo del arreglo
    const toggleGrupo = (value: string) => {
        setGruposSeleccionados((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            } else {
                return [...prev, value];
            }
        });
    };

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

                    {/* Sección Dinámica de Grupos Especiales */}
                    <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter">
                        <View className="flex flex-row items-center mb-stack-sm">
                            <MaterialIcons name="group" size={24} className="text-primary mr-2" color="#008080" />
                            <Text className="font-headline-sm text-headline-sm text-on-surface">Grupos Especiales</Text>
                        </View>
                        <Text className="font-label-md text-on-surface-variant mb-4">Puede seleccionar más de una opción si aplica.</Text>

                        {/* El Grid de 2x5 */}
                        <View className="flex flex-row flex-wrap justify-between gap-y-3">
                            {GRUPOS_ESPECIALES.map((grupo) => {
                                const isSelected = gruposSeleccionados.includes(grupo.value);
                                return (
                                    <TouchableOpacity
                                        key={grupo.id}
                                        onPress={() => toggleGrupo(grupo.value)}
                                        activeOpacity={0.7}
                                        // Ocupa el 48% del ancho para forzar 2 columnas
                                        className={`w-[48%] h-14 px-2 flex flex-row items-center justify-center rounded-xl border ${isSelected
                                            ? 'border-primary'
                                            : 'border-outline-variant'
                                            }`}
                                    >
                                        <MaterialIcons
                                            name={isSelected ? "check-box" : "check-box-outline-blank"}
                                            size={20}
                                            color={isSelected ? "#008080" : "#9CA3AF"}
                                            className="mr-2"
                                        />
                                        <Text
                                            className={`flex-1 font-body-sm text-left leading-tight ${isSelected ? "#008080" : 'text-on-surface'
                                                }`}
                                        >
                                            {grupo.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Biologicals Builder Section (Se mantiene igual por ahora) */}
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