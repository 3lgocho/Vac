import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Switch, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ETNIAS_INDIGENAS, EtniaItem } from '../../constants/etnias';
import { useRegistroStore } from '../../store/registroStore';
import { GRUPOS_ESPECIALES } from '../../constants/grupos_especiales';

export default function Paso2() {
    const router = useRouter();

    // 1. Estados Globales desde Zustand (ahora incluimos la dirección)
    const {
        esIndigena, etnia, etniaLabel,
        comunidad, calle, numeroCasa,
        gruposSeleccionados,
        toggleGrupo,
        updateField
    } = useRegistroStore();

    // 2. Estados Locales (Solo UI)
    const [searchIndigena, setSearchIndigena] = useState('');
    const [isListOpen, setIsListOpen] = useState(false);

    // Función para calcular la edad exacta conectada a Zustand

    return (
        <SafeAreaView className="bg-surface flex-1">
            <ScrollView
                className="w-full h-full"
                contentContainerClassName="max-w-3xl mx-auto w-full px-margin-mobile pt-stack-lg flex-grow"
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={true}>

                {/* Dirección Section */}
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg">
                    <View className="flex flex-row items-center mb-stack-sm">
                        <MaterialIcons name="location-on" size={24} className="text-primary mr-2" color="#008080" />
                        <Text className="font-headline-sm text-on-surface">Dirección</Text>
                    </View>
                    <View className="flex flex-col gap-4">
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Comunidad/Localidad</Text>
                            <TextInput
                                value={comunidad}
                                onChangeText={(text) => updateField('comunidad', text)}
                                className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest"
                                placeholder="Ingrese la comunidad o localidad"
                            />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Calle / Avenida</Text>
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

                {/* Etnia Section */}
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg z-10">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Etnia</Text>

                    {!esIndigena && (
                        <View className="flex flex-col gap-stack-sm mb-6">
                            <Text className="font-label-lg text-on-surface-variant mb-2">Seleccione una opción</Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                {['Blanco o Criollo', 'Afrodescendiente', 'Mestizo', 'Otro'].map((opcion) => (
                                    <TouchableOpacity
                                        key={opcion}
                                        onPress={() => updateField('etnia', opcion)}
                                        className={`h-touch-target-min px-4 flex items-center justify-center rounded-full border ${etnia === opcion
                                            ? 'border-primary bg-primary-container'
                                            : 'border-outline-variant bg-surface-container-lowest'
                                            }`}
                                    >
                                        <Text className={`font-body-md ${etnia === opcion ? 'text-on-primary font-bold' : 'text-on-surface'
                                            }`}>
                                            {opcion}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Switch Grupo Indígena */}
                    <View className="flex flex-row items-center justify-between py-2 border-t border-outline-variant pt-4">
                        <View className="flex-1 pr-4">
                            <Text className="font-label-lg text-on-surface">¿Pertenece a un grupo indígena?</Text>
                            <Text className="text-on-surface-variant text-sm">Active esta opción si aplica</Text>
                        </View>
                        <Switch
                            value={esIndigena}
                            onValueChange={(value: boolean) => {
                                updateField('esIndigena', value);
                                if (!value) {
                                    updateField('etnia', '');
                                    updateField('etniaLabel', '');
                                }
                            }}
                            trackColor={{ false: "#D1D5DB", true: "#008080" }}
                            thumbColor={esIndigena ? "#FFFFFF" : "#F3F4F6"}
                        />
                    </View>

                    {esIndigena && (
                        <View className="mt-4">
                            <Text className="font-label-md text-on-surface mb-1">Grupo Indígena Seleccionado</Text>
                            <TouchableOpacity
                                onPress={() => setIsListOpen(true)}
                                className="flex flex-row items-center justify-between border border-outline-variant rounded-lg bg-surface-container-low px-3 h-12"
                            >
                                <Text className={`font-body-md ${etniaLabel ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                    {etniaLabel || "Toque para buscar y seleccionar..."}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* MODAL NATIVO PARA LA BÚSQUEDA */}
                <Modal
                    visible={isListOpen}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsListOpen(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-surface-container-lowest h-[80%] rounded-t-3xl p-6 shadow-xl">

                            <View className="flex flex-row justify-between items-center mb-4">
                                <Text className="font-headline-sm text-on-surface">Buscar Etnia</Text>
                                <TouchableOpacity onPress={() => setIsListOpen(false)} className="p-2">
                                    <MaterialIcons name="close" size={24} color="#1F2937" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex flex-row items-center border border-primary rounded-lg bg-surface-container-low px-3 mb-4">
                                <MaterialIcons name="search" size={20} color="#008080" />
                                <TextInput
                                    autoFocus={true}
                                    className="flex-1 h-12 px-2 text-on-surface"
                                    placeholder="Ej. Wayuu..."
                                    value={searchIndigena}
                                    onChangeText={setSearchIndigena}
                                />
                                {searchIndigena.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchIndigena('')}>
                                        <MaterialIcons name="cancel" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <ScrollView keyboardShouldPersistTaps="handled" className="flex-1">
                                {ETNIAS_INDIGENAS
                                    .filter(item =>
                                        item.label.toLowerCase().includes(searchIndigena.toLowerCase()) ||
                                        item.id.includes(searchIndigena)
                                    )
                                    .map((item: EtniaItem) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            className="px-4 py-4 border-b border-surface-container-highest active:bg-surface-container"
                                            onPress={() => {
                                                updateField('etnia', item.value);
                                                updateField('etniaLabel', item.label);
                                                setIsListOpen(false);
                                                setSearchIndigena('');
                                            }}
                                        >
                                            <Text className="text-on-surface font-body-lg">{item.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                {ETNIAS_INDIGENAS.filter(item =>
                                    item.label.toLowerCase().includes(searchIndigena.toLowerCase())
                                ).length === 0 && (
                                        <View className="px-4 py-8 items-center">
                                            <Text className="text-on-surface-variant italic text-sm">No se encontraron etnias coincidentes</Text>
                                        </View>
                                    )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter">
                    <View className="flex flex-row items-center mb-stack-sm">
                        <MaterialIcons name="group" size={24} className="text-primary mr-2" color="#008080" />
                        <Text className="font-headline-sm text-headline-sm text-on-surface">Grupos Especiales</Text>
                    </View>
                    <Text className="font-label-md text-on-surface-variant mb-4">Puede seleccionar más de una opción si aplica.</Text>

                    <View className="flex flex-row flex-wrap justify-between gap-y-3">
                        {GRUPOS_ESPECIALES.map((grupo) => {
                            const isSelected = gruposSeleccionados.includes(grupo.value);
                            return (
                                <TouchableOpacity
                                    key={grupo.id}
                                    onPress={() => toggleGrupo(grupo.value)}
                                    activeOpacity={0.7}
                                    className={`w-[48%] h-14 px-2 flex flex-row items-center justify-center rounded-xl border ${isSelected ? 'border-primary' : 'border-outline-variant'}`}
                                >
                                    <MaterialIcons
                                        name={isSelected ? "check-box" : "check-box-outline-blank"}
                                        size={20}
                                        color={isSelected ? "#008080" : "#9CA3AF"}
                                        className="mr-2"
                                    />
                                    <Text className={`flex-1 font-body-sm text-left leading-tight ${isSelected ? "text-primary" : 'text-on-surface'}`}>
                                        {grupo.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex flex-row gap-gutter mt-stack-lg mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="flex-1 h-touch-target-min rounded-lg bg-surface-container-lowest border border-outline flex items-center justify-center">
                        <Text className="text-on-surface font-label-lg uppercase tracking-wide">Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/registro/paso3')} className="flex-1 h-touch-target-min rounded-lg bg-primary flex items-center justify-center">
                        <Text className="text-on-primary font-label-lg uppercase tracking-wide">Siguiente</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView >
        </SafeAreaView >
    );
}