// front/components/registro/SeccionDireccion.tsx
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistroStore } from '../../store/registroStore';

export default function SeccionDireccion() {
    const { comunidad, calle, numeroCasa, updateField } = useRegistroStore();

    return (
        <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg">
            <View className="flex flex-row items-center mb-stack-sm">
                <MaterialIcons name="location-on" size={24} className="text-primary mr-2" color="#008080" />
                <Text className="font-headline-sm text-on-surface">Dirección</Text>
            </View>
            <View className="flex flex-col gap-4">
                <View className="flex flex-col gap-unit">
                    <Text className="font-label-lg text-on-surface-variant mb-1">Comunidad/Localidad <Text className="text-error">*</Text></Text>
                    <TextInput
                        value={comunidad}
                        onChangeText={(text) => updateField('comunidad', text)}
                        className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest"
                        placeholder="Ingrese la comunidad o localidad"
                    />
                </View>
                <View className="flex flex-col gap-unit">
                    <Text className="font-label-lg text-on-surface-variant mb-1">Calle / Avenida <Text className="text-error">*</Text></Text>
                    <TextInput
                        value={calle}
                        onChangeText={(text) => updateField('calle', text)}
                        className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest"
                        placeholder="Nombre de calle o avenida"
                    />
                </View>
                <View className="flex flex-col gap-unit">
                    <Text className="font-label-lg text-on-surface-variant mb-1">Nº de Casa</Text>
                    <TextInput
                        value={numeroCasa}
                        onChangeText={(text) => updateField('numeroCasa', text)}
                        className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest"
                        placeholder="Ej. 12B"
                    />
                </View>
            </View>
        </View>
    );
}