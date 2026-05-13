import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Paso2() {
    const router = useRouter();

    return (
        <SafeAreaView className="bg-surface flex-1">
            {/* TopAppBar */}
            <View className="bg-surface-container-lowest border-b border-outline-variant flex flex-col w-full z-50">
                <View className="flex flex-row items-center px-4 h-16 w-full">
                    <TouchableOpacity onPress={() => router.back()} className="h-touch-target-min w-touch-target-min flex items-center justify-center rounded-full mr-2">
                        <Text className="material-symbols-outlined text-on-surface">arrow_back</Text>
                    </TouchableOpacity>
                    <Text className="font-headline-md font-bold text-primary-container flex-1">Registro de Vacunación</Text>
                    <TouchableOpacity className="h-touch-target-min w-touch-target-min flex items-center justify-center rounded-full">
                        <Text className="material-symbols-outlined text-on-surface">more_vert</Text>
                    </TouchableOpacity>
                </View>
                <View className="w-full bg-secondary-fixed h-2">
                    <View className="bg-primary-container h-full" style={{ width: '66.66%' }}></View>
                </View>
                <View className="px-margin-mobile py-stack-sm flex flex-row justify-between items-center">
                    <Text className="text-on-surface-variant font-label-md">Paso 2 de 3</Text>
                    <Text className="text-on-surface-variant font-label-md">Demografía</Text>
                </View>
            </View>

            <ScrollView className="max-w-3xl mx-auto px-margin-mobile py-stack-lg w-full flex-1">
                <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg mb-stack-lg">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Datos Personales</Text>
                    <View className="flex flex-col gap-4 mb-stack-md">
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Fecha de Nacimiento</Text>
                            <TextInput className="h-touch-target-min w-full rounded-DEFAULT border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="DD/MM/AAAA" />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Edad</Text>
                            <TextInput className="h-touch-target-min w-full rounded-DEFAULT border border-outline-variant px-4 bg-surface-container-low text-on-surface-variant font-body-md" value="-- años" editable={false} />
                        </View>
                    </View>
                </View>

                <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg mb-stack-lg">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Dirección</Text>
                    <View className="flex flex-col gap-4">
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Comunidad/Localidad</Text>
                            <TextInput className="h-touch-target-min w-full rounded-DEFAULT border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="Ingrese la comunidad o localidad" />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Calle / Avenida</Text>
                            <TextInput className="h-touch-target-min w-full rounded-DEFAULT border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="Nombre de calle o avenida" />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Nº de Casa</Text>
                            <TextInput className="h-touch-target-min w-full rounded-DEFAULT border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="Ej. 12B" />
                        </View>
                    </View>
                </View>

                {/* Etnia Section */}
                <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg mb-stack-lg">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Etnia</Text>
                    <View className="flex flex-col gap-stack-sm">
                        <Text className="font-label-lg text-on-surface-variant mb-2">Seleccione una opción</Text>
                        <View className="flex flex-row flex-wrap gap-2">
                            <TouchableOpacity className="h-touch-target-min px-4 flex items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest">
                                <Text className="text-on-surface-variant font-body-md">Blanco o Criollo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="h-touch-target-min px-4 flex items-center justify-center rounded-full border border-primary-container bg-primary-fixed-dim">
                                <Text className="text-on-primary-fixed-variant font-semibold font-body-md">Afrodescendiente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="h-touch-target-min px-4 flex items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest">
                                <Text className="text-on-surface-variant font-body-md">Mestizo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex flex-row gap-gutter mt-stack-lg mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="flex-1 h-touch-target-min rounded-DEFAULT border border-primary-container flex items-center justify-center">
                        <Text className="text-primary-container font-label-lg uppercase tracking-wide">Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/registro/paso3')} className="flex-1 h-touch-target-min rounded-DEFAULT bg-primary-container flex items-center justify-center">
                        <Text className="text-on-primary font-label-lg uppercase tracking-wide">Siguiente</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}