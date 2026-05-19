import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRegistroStore } from '../../store/registroStore';

export default function Paso1() {
    const router = useRouter();

    // Asegúrate de tener 'telefono' en tu store de Zustand
    const {
        genero, tipoDoc, cedula, nombre, apellido,
        fechaNacimiento, edad, ordenHijo, telefono, updateField
    } = useRegistroStore();

    const [isOpenDoc, setIsOpenDoc] = useState(false);

    const calcularEdad = (fecha: string) => {
        if (fecha.length < 10) {
            updateField('edad', '-- años');
            return;
        }

        const [dia, mes, anio] = fecha.split('/');
        const fechaNac = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        const hoy = new Date();

        if (isNaN(fechaNac.getTime()) || fechaNac > hoy) {
            updateField('edad', 'Fecha inválida');
            return;
        }

        let ageYears = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            ageYears--;
        }

        if (ageYears > 0) {
            updateField('edad', `${ageYears} años`);
        } else {
            let ageMonths = (hoy.getFullYear() - fechaNac.getFullYear()) * 12 + (hoy.getMonth() - fechaNac.getMonth());
            if (hoy.getDate() < fechaNac.getDate()) {
                ageMonths--;
            }

            if (ageMonths > 0) {
                updateField('edad', `${ageMonths} meses`);
            } else {
                updateField('edad', 'Días de nacido');
            }
        }
    };

    const handleDateChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
        }

        updateField('fechaNacimiento', formatted);
        calcularEdad(formatted);
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <ScrollView className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile pt-stack-lg">

                {/* --- BLOQUE 1: IDENTIDAD Y CONTACTO --- */}
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

                        {/* Número de Teléfono (Corregido) */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Número de Teléfono</Text>
                            <View className="flex flex-row items-center">
                                <TextInput
                                    value={telefono}
                                    onChangeText={(text) => {
                                        // 1. Eliminamos cualquier caracter que no sea número
                                        let soloNumeros = text.replace(/\D/g, '');

                                        // 2. Truco UX: Si el usuario escribe directamente "4" o "2", 
                                        // le autocompletamos el "0" inicial mágicamente.
                                        if (soloNumeros.length === 1 && (soloNumeros === '4' || soloNumeros === '2')) {
                                            soloNumeros = '0' + soloNumeros;
                                        }

                                        // 3. Forzamos a que el número SIEMPRE comience con 0. 
                                        // Si intenta meter un 5, 8 o 9 de primero, simplemente lo bloqueamos.
                                        if (soloNumeros.length > 0 && soloNumeros[0] !== '0') {
                                            return;
                                        }

                                        // Actualizamos el estado en Zustand
                                        updateField('telefono', soloNumeros);
                                    }}
                                    className="h-touch-target-min w-full border rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                                    placeholder="Ej. 04141234567"
                                    keyboardType="numeric"
                                    maxLength={11} // Ahora son 11 dígitos porque incluimos el cero inicial
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* --- BLOQUE 2: PERFIL BIOLÓGICO / DEMOGRÁFICO --- */}
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-stack-lg">
                    <View className="flex flex-row items-center mb-stack-md">
                        <MaterialIcons name="cake" size={24} className="text-primary mr-2" color="#008080" />
                        <Text className="font-headline-sm text-headline-sm text-on-surface">
                            Perfil Biológico
                        </Text>
                    </View>

                    <View className="flex flex-col gap-4 mb-stack-md">

                        {/* Fecha de Nacimiento y Edad en la misma fila para ahorrar espacio (opcional) o apilados */}
                        <View className="flex flex-row gap-4">
                            <View className="flex-1 flex flex-col gap-unit">
                                <Text className="font-label-lg text-on-surface-variant mb-1">Fecha Nacimiento</Text>
                                <TextInput
                                    className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest"
                                    placeholder="DD/MM/AAAA"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    value={fechaNacimiento}
                                    onChangeText={handleDateChange}
                                />
                            </View>
                            <View className="flex-1 flex flex-col gap-unit">
                                <Text className="font-label-lg text-on-surface-variant mb-1">Edad</Text>
                                <TextInput
                                    className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 bg-surface-container-low text-on-surface-variant font-body-md"
                                    value={edad}
                                    editable={false}
                                />
                            </View>
                        </View>

                        {/* Género (Eliminamos el duplicado, dejamos este que está junto a los datos biológicos) */}
                        <View className="flex flex-col gap-unit mt-2">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Género</Text>
                            <View className="flex flex-row w-full bg-surface-container-low rounded-lg border border-outline-variant p-[2px]">
                                <TouchableOpacity
                                    onPress={() => updateField('genero', 'Femenino')}
                                    className={`flex-1 items-center justify-center h-touch-target-min rounded-md ${genero === 'Femenino' ? 'bg-surface-container-lowest shadow-sm' : ''}`}>
                                    <Text className={`font-label-lg text-label-lg ${genero === 'Femenino' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        Femenino
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => updateField('genero', 'Masculino')}
                                    className={`flex-1 items-center justify-center h-touch-target-min rounded-md ${genero === 'Masculino' ? 'bg-surface-container-lowest shadow-sm' : ''}`}>
                                    <Text className={`font-label-lg text-label-lg ${genero === 'Masculino' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        Masculino
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Orden de hijo */}
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-md text-label-md text-on-surface mb-1">Orden de hijo</Text>
                            <TextInput
                                value={ordenHijo}
                                onChangeText={(text) => updateField('ordenHijo', text.replace(/\D/g, ''))}
                                className="h-touch-target-min w-full border rounded-lg border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md px-4"
                                placeholder="Ej. 1 (Primer hijo)"
                                keyboardType="numeric"
                                maxLength={2}
                            />
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
            </ScrollView >
        </SafeAreaView >
    );
}