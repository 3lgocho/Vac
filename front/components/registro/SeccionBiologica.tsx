// front/components/registro/SeccionBiologica.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistroStore } from '../../store/registroStore';
import { useCalculoEdad } from '../../hooks/useCalculoEdad';

export default function SeccionBiologica() {
    const { genero, fechaNacimiento, edad, ordenHijo, updateField } = useRegistroStore();
    const { handleDateChange } = useCalculoEdad();

    return (
        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-stack-lg">
            <View className="flex flex-row items-center mb-stack-md">
                <MaterialIcons name="cake" size={24} className="text-primary mr-2" color="#008080" />
                <Text className="font-headline-sm text-headline-sm text-on-surface">
                    Perfil Biológico
                </Text>
            </View>

            <View className="flex flex-col gap-4 mb-stack-md">
                {/* Fecha de Nacimiento y Edad */}
                <View className="flex flex-row gap-4">
                    <View className="flex-1 flex flex-col gap-unit">
                        <Text className="font-label-lg text-on-surface-variant mb-1">Fecha Nacimiento <Text className="text-error">*</Text></Text>
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

                {/* Género */}
                <View className="flex flex-col gap-unit mt-2">
                    <Text className="font-label-md text-label-md text-on-surface mb-1">Sexo <Text className="text-error">*</Text></Text>
                    <View className="flex-row w-full border border-outline-variant/50 mt-1 bg-surface-container-low rounded-lg p-1">
                        <TouchableOpacity
                            onPress={() => updateField('genero', 'Femenino')}
                            className={`flex-1 items-center justify-center h-touch-target-min rounded-md ${genero === 'Femenino' ? 'bg-surface-container-lowest' : ''}`}
                            style={genero === 'Femenino' ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 } : {}}>
                            <Text className={`font-label-lg font-semibold text-lg ${genero === 'Femenino' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                Femenino
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => updateField('genero', 'Masculino')}
                            className={`flex-1 items-center justify-center h-touch-target-min rounded-md ${genero === 'Masculino' ? 'bg-surface-container-lowest' : ''}`}
                            style={genero === 'Masculino' ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 } : {}}>
                            <Text className={`font-label-lg font-semibold text-lg ${genero === 'Masculino' ? 'text-primary' : 'text-on-surface-variant'}`}>
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
    );
}