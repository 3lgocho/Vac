// front/components/registro/SeccionIdentidad.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistroStore } from '../../store/registroStore';

export default function SeccionIdentidad() {
    const { tipoDoc, cedula, nombre, apellido, telefono, updateField } = useRegistroStore();
    const [isOpenDoc, setIsOpenDoc] = useState(false);

    return (
        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-stack-lg z-50">
            <View className="flex flex-row items-center mb-stack-md">
                <MaterialIcons name="person" size={24} className="text-primary mr-2" color="#008080" />
                <Text className="font-headline-sm text-headline-sm text-on-surface">
                    Identidad y Contacto
                </Text>
            </View>

            <View className="space-y-stack-md gap-4">
                {/* Cédula */}
                <View className="flex flex-col gap-unit relative z-50">
                    <Text className="font-label-md text-label-md text-on-surface mb-1">Documento de Identidad</Text>
                    <View className="flex flex-row relative z-50">
                        <TouchableOpacity
                            onPress={() => setIsOpenDoc(!isOpenDoc)}
                            className="h-touch-target-min border border-r-0 rounded-l-lg border-outline-variant bg-surface-container-lowest flex-row items-center justify-between px-3 w-20 z-50"
                        >
                            <Text className="text-on-surface font-body-md text-body-md">{tipoDoc}</Text>
                            <MaterialIcons name={isOpenDoc ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#4B5563" />
                        </TouchableOpacity>

                        <TextInput
                            value={cedula}
                            onChangeText={(text) => updateField('cedula', text.replace(/\D/g, ''))}
                            className="flex-1 h-touch-target-min border rounded-r-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                            placeholder="Ej. 12345678"
                            keyboardType="numeric"
                            maxLength={20}
                        />

                        {isOpenDoc && (
                            <View className="absolute top-[52px] left-0 w-20 bg-white border border-gray-300 rounded-lg shadow-md z-[100] overflow-hidden elevation-5">
                                <TouchableOpacity
                                    className="px-4 py-3 border-b border-gray-200 active:bg-gray-100 bg-white"
                                    onPress={() => { updateField('tipoDoc', 'V'); setIsOpenDoc(false); }}
                                >
                                    <Text className="text-center font-body-md text-lg text-gray-800">V</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="px-4 py-3 active:bg-gray-100 bg-white"
                                    onPress={() => { updateField('tipoDoc', 'E'); setIsOpenDoc(false); }}
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

                {/* Número de Teléfono */}
                <View className="flex flex-col gap-unit">
                    <Text className="font-label-md text-label-md text-on-surface mb-1">Número de Teléfono</Text>
                    <View className="flex flex-row items-center">
                        <TextInput
                            value={telefono}
                            onChangeText={(text) => {
                                let soloNumeros = text.replace(/\D/g, '');
                                if (soloNumeros.length === 1 && (soloNumeros === '4' || soloNumeros === '2')) {
                                    soloNumeros = '0' + soloNumeros;
                                }
                                if (soloNumeros.length > 0 && soloNumeros[0] !== '0') return;
                                updateField('telefono', soloNumeros);
                            }}
                            className="h-touch-target-min w-full border rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                            placeholder="Ej. 04141234567"
                            keyboardType="numeric"
                            maxLength={11}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}