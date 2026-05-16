import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Paso1() {
    const router = useRouter();
    const [genero, setGenero] = useState('Femenino'); // Femenino estará seleccionado por defecto
    const [tipoDoc, setTipoDoc] = useState('V'); // Por defecto será 'V'
    const [isOpen, setIsOpen] = useState(false); // Estado para el dropdown de V/E 


    return (
        <SafeAreaView className="bg-background flex-1">
            {/* Header */}
            <View className="bg-surface-container-lowest border-b border-surface-container-highest h-16 flex flex-row items-center px-4 w-full z-50">
                <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 flex items-center justify-center">
                    <MaterialIcons name="arrow-back" size={24} className="text-primary" color="#008080" />
                </TouchableOpacity>
                <Text className="ml-2 font-headline-sm text-headline-sm text-primary font-bold tracking-tight">Registro de Vacunación</Text>
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
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-stack-lg">
                    <View className="flex flex-row items-center mb-stack-md">
                        <MaterialIcons name="badge" size={24} className="text-primary mr-2" color="#008080" />
                        <Text className="font-headline-sm text-headline-sm text-on-surface">
                            Datos de Identificación
                        </Text>
                    </View>

                    <View className="space-y-stack-md gap-4">
                        {/* Cédula */}
                        <View className="flex flex-col gap-unit relative z-50">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Documento de Identidad</Text>
                            {/* Contenedor relativo para que el dropdown se posicione respecto a este */}
                            <View className="flex flex-row relative z-50">

                                <TouchableOpacity
                                    onPress={() => setIsOpen(!isOpen)}
                                    className="h-touch-target-min border border-r-0 rounded-l-lg border-outline-variant bg-surface-container-lowest flex-row items-center justify-between px-3 w-20 z-50"
                                >
                                    <Text className="text-on-surface font-body-md text-body-md">{tipoDoc}</Text>
                                    <MaterialIcons name={isOpen ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#4B5563" />
                                </TouchableOpacity>

                                <TextInput
                                    className="flex-1 h-touch-target-min border rounded-r-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                                    placeholder="Ej. 12345678"
                                    keyboardType="phone-pad"
                                />

                                {/* --- Menú Desplegable Absoluto --- */}
                                {isOpen && (
                                    <View className="absolute top-[52px] left-0 w-20 bg-white border border-gray-300 rounded-lg shadow-md z-[100] overflow-hidden elevation-5">
                                        <TouchableOpacity
                                            className="px-4 py-3 border-b border-gray-200 active:bg-gray-100 bg-white"
                                            onPress={() => { setTipoDoc('V'); setIsOpen(false); }}
                                        >
                                            <Text className="text-center font-body-md text-lg text-gray-800">V</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="px-4 py-3 active:bg-gray-100 bg-white"
                                            onPress={() => { setTipoDoc('E'); setIsOpen(false); }}
                                        >
                                            <Text className="text-center font-body-md text-lg text-gray-800">E</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Nombre */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Nombre</Text>
                            <TextInput className="h-touch-target-min w-full border rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT px-4" />
                        </View>

                        {/* Apellido */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Apellido</Text>
                            <TextInput className="h-touch-target-min w-full border rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-DEFAULT px-4" />
                        </View>

                        {/* Gender Segmented Control */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Género</Text>
                            <View className="flex flex-row w-full bg-surface-container-low rounded-lg border border-outline-variant p-[2px]">
                                {/* Botón Femenino */}
                                <TouchableOpacity
                                    onPress={() => setGenero('Femenino')}
                                    className={`flex-1 items-center justify-center h-touch-target-min rounded-md ${genero === 'Femenino' ? 'bg-surface-container-lowest shadow-sm' : ''}`}>
                                    <Text className={`font-label-lg text-label-lg ${genero === 'Femenino' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        Femenino
                                    </Text>
                                </TouchableOpacity>

                                {/* Botón Masculino */}
                                <TouchableOpacity
                                    onPress={() => setGenero('Masculino')}
                                    className={`flex-1 items-center justify-center h-touch-target-min rounded-md ${genero === 'Masculino' ? 'bg-surface-container-lowest shadow-sm' : ''}`}>
                                    <Text className={`font-label-lg text-label-lg ${genero === 'Masculino' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        Masculino
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Area */}
                <View className="mt-stack-lg mb-8 flex flex-row justify-end">
                    <TouchableOpacity
                        onPress={() => router.push('/registro/paso2')}
                        className="h-touch-target-min px-8 bg-primary rounded-lg flex flex-row items-center justify-center gap-2 w-full">
                        <Text className="text-on-primary font-label-lg text-label-lg uppercase">Siguiente</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}