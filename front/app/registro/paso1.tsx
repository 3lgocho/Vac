import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRegistroStore } from '../../store/registroStore'; // Ajusta el path si es necesario

export default function Paso1() {
    const router = useRouter();

    // Extraemos las variables y la función de actualización desde Zustand
    const { genero, tipoDoc, cedula, nombre, apellido, updateField } = useRegistroStore();

    // Solo mantenemos local el estado de apertura del dropdown de la cédula
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SafeAreaView className="bg-background flex-1">
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
                            <View className="flex flex-row relative z-50">

                                <TouchableOpacity
                                    onPress={() => setIsOpen(!isOpen)}
                                    className="h-touch-target-min border border-r-0 rounded-l-lg border-outline-variant bg-surface-container-lowest flex-row items-center justify-between px-3 w-20 z-50"
                                >
                                    <Text className="text-on-surface font-body-md text-body-md">{tipoDoc}</Text>
                                    <MaterialIcons name={isOpen ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#4B5563" />
                                </TouchableOpacity>

                                <TextInput
                                    value={cedula}
                                    onChangeText={(text) => {
                                        // Expresión regular que reemplaza cualquier cosa que NO sea número (\D) por vacío ('')
                                        const soloNumeros = text.replace(/\D/g, '');
                                        updateField('cedula', soloNumeros);
                                    }}
                                    className="flex-1 h-touch-target-min border rounded-r-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                                    placeholder="Ej. 12345678"
                                    keyboardType="numeric"
                                />

                                {/* Menú Desplegable Absoluto de Cédula */}
                                {isOpen && (
                                    <View className="absolute top-[52px] left-0 w-20 bg-white border border-gray-300 rounded-lg shadow-md z-[100] overflow-hidden elevation-5">
                                        <TouchableOpacity
                                            className="px-4 py-3 border-b border-gray-200 active:bg-gray-100 bg-white"
                                            onPress={() => { updateField('tipoDoc', 'V'); setIsOpen(false); }}
                                        >
                                            <Text className="text-center font-body-md text-lg text-gray-800">V</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="px-4 py-3 active:bg-gray-100 bg-white"
                                            onPress={() => { updateField('tipoDoc', 'E'); setIsOpen(false); }}
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
                            <TextInput
                                value={nombre}
                                onChangeText={(text) => updateField('nombre', text)}
                                className="h-touch-target-min w-full border rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                                placeholder="Ej. Juan"
                            />
                        </View>

                        {/* Apellido */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Apellido</Text>
                            <TextInput
                                value={apellido}
                                onChangeText={(text) => updateField('apellido', text)}
                                className="h-touch-target-min w-full border rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                                placeholder="Ej. Pérez"
                            />
                        </View>

                        <View className="flex flex-col gap-unit relative z-50">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Numero de Telefono</Text>
                            <View className="flex flex-row relative z-50">

                                <TouchableOpacity
                                    onPress={() => setIsOpen(!isOpen)}
                                    className="h-touch-target-min border border-r-0 rounded-l-lg border-outline-variant bg-surface-container-lowest flex-row items-center justify-between px-3 w-20 z-50"
                                >
                                    <Text className="text-on-surface font-body-md text-body-md">{tipoDoc}</Text>
                                    <MaterialIcons name={isOpen ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#4B5563" />
                                </TouchableOpacity>
                                <Text>+58</Text>
                                <TextInput
                                    value={cedula}
                                    onChangeText={(text) => {
                                        // Expresión regular que reemplaza cualquier cosa que NO sea número (\D) por vacío ('')
                                        const soloNumeros = text.replace(/\D/g, '');
                                        updateField('cedula', soloNumeros);
                                    }}
                                    className="flex-1 h-touch-target-min border rounded-r-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                                    placeholder="Ej. 12345678"
                                    keyboardType="numeric"
                                />

                                {/* Menú Desplegable Absoluto de Cédula */}
                                {isOpen && (
                                    <View className="absolute top-[52px] left-0 w-20 bg-white border border-gray-300 rounded-lg shadow-md z-[100] overflow-hidden elevation-5">
                                        <TouchableOpacity
                                            className="px-4 py-3 border-b border-gray-200 active:bg-gray-100 bg-white"
                                            onPress={() => { updateField('tipoDoc', 'V'); setIsOpen(false); }}
                                        >
                                            <Text className="text-center font-body-md text-lg text-gray-800">V</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="px-4 py-3 active:bg-gray-100 bg-white"
                                            onPress={() => { updateField('tipoDoc', 'E'); setIsOpen(false); }}
                                        >
                                            <Text className="text-center font-body-md text-lg text-gray-800">E</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>


                        {/* Gender Segmented Control */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Género</Text>
                            <View className="flex flex-row w-full bg-surface-container-low rounded-lg border border-outline-variant p-[2px]">

                                {/* Botón Femenino */}
                                <TouchableOpacity
                                    onPress={() => updateField('genero', 'Femenino')}
                                    className={`flex-1 items-center justify-center h-touch-target-min rounded-md ${genero === 'Femenino' ? 'bg-surface-container-lowest shadow-sm' : ''}`}>
                                    <Text className={`font-label-lg text-label-lg ${genero === 'Femenino' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        Femenino
                                    </Text>
                                </TouchableOpacity>

                                {/* Botón Masculino */}
                                <TouchableOpacity
                                    onPress={() => updateField('genero', 'Masculino')}
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