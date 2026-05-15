import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function Paso2() {
    const router = useRouter();
    const [etnia, setEtnia] = useState(''); // Estado para la etnia única
    const [esIndigena, setEsIndigena] = useState(false); // Estado del Switch
    const [searchIndigena, setSearchIndigena] = useState(''); // Estado del buscador
    const [isListOpen, setIsListOpen] = useState(false); // Control del dropdown

    return (
        <SafeAreaView className="bg-surface flex-1">
            {/* TopAppBar */}
            <View className="bg-surface-container-lowest border-b border-surface-container-highest h-16 flex flex-row items-center px-4 w-full z-50">
                <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 flex items-center justify-center">
                    <MaterialIcons name="arrow-back" size={24} className="text-primary" color="#008080" />
                </TouchableOpacity>
                <Text className="ml-2 font-headline-sm text-headline-sm text-primary font-bold tracking-tight">Registro de Vacunación</Text>
            </View>

            <ScrollView
                className="w-full h-full"
                contentContainerClassName="max-w-3xl mx-auto w-full px-margin-mobile pt-stack-lg flex-grow"
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={true}>

                {/* Progress Indicator */}
                <View className="mb-stack-lg">
                    <View className="flex flex-row justify-between items-center mb-stack-sm">
                        <Text className="font-label-md text-label-md text-on-surface">Paso 2 de 3</Text>
                        <Text className="font-label-lg text-label-lg text-primary">Datos Personales</Text>
                    </View>
                    <View className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <View className="h-full bg-primary rounded-full" style={{ width: '66.66%' }}></View>
                    </View>
                </View>
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Datos Personales</Text>
                    <View className="flex flex-col gap-4 mb-stack-md">
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Fecha de Nacimiento</Text>
                            <TextInput className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="DD/MM/AAAA" />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Edad</Text>
                            <TextInput className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 bg-surface-container-low text-on-surface-variant font-body-md" value="-- años" editable={false} />
                        </View>
                    </View>
                </View>

                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg">
                    <View className="flex flex-row items-center mb-stack-sm">
                        <MaterialIcons name="location-on" size={24} className="text-primary mr-2" color="#008080" />
                        <Text className="font-headline-sm text-on-surface">Dirección</Text>
                    </View>
                    <View className="flex flex-col gap-4">
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Comunidad/Localidad</Text>
                            <TextInput className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="Ingrese la comunidad o localidad" />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Calle / Avenida</Text>
                            <TextInput className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="Nombre de calle o avenida" />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Nº de Casa</Text>
                            <TextInput className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest" placeholder="Ej. 12B" />
                        </View>
                    </View>
                </View>
                {/* Etnia Section */}
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Etnia</Text>

                    {/* Mostrar los botones de Etnia SOLO si el switch está apagado */}
                    {!esIndigena && (
                        <View className="flex flex-col gap-stack-sm mb-6">
                            <Text className="font-label-lg text-on-surface-variant mb-2">Seleccione una opción</Text>
                            <View className="flex flex-row flex-wrap gap-2">
                                {['Blanco o Criollo', 'Afrodescendiente', 'Mestizo', 'Otro'].map((opcion) => (
                                    <TouchableOpacity
                                        key={opcion}
                                        onPress={() => setEtnia(opcion)}
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
                                setEsIndigena(value);
                                if (!value) {
                                    setIsListOpen(false); // Cerrar lista si apaga el switch
                                } else {
                                    setEtnia(''); // Opcional: Limpiar la etnia general si enciende el switch
                                }
                            }}
                            trackColor={{ false: "#D1D5DB", true: "#008080" }}
                            thumbColor={esIndigena ? "#FFFFFF" : "#F3F4F6"}
                        />
                    </View>

                    {/* Dropdown con Searchbar (Solo aparece si el switch es true) */}
                    {esIndigena && (
                        <View className="mt-4 relative z-50">
                            <Text className="font-label-md text-on-surface mb-1">Buscar Grupo Indígena</Text>
                            <View className="flex flex-row items-center border border-outline-variant rounded-lg bg-surface-container-low px-3">
                                <MaterialIcons name="search" size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 h-12 px-2 text-on-surface"
                                    placeholder="Ej. 1 Wayuu..."
                                    value={searchIndigena}
                                    onChangeText={(text) => {
                                        setSearchIndigena(text);
                                        setIsListOpen(text.length > 0);
                                    }}
                                    onFocus={() => setIsListOpen(true)}
                                />
                                {searchIndigena.length > 0 && (
                                    <TouchableOpacity onPress={() => { setSearchIndigena(''); setIsListOpen(false); }}>
                                        <MaterialIcons name="cancel" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Lista Desplegable (Dropdown) */}
                            {isListOpen && (
                                <View className="absolute top-[75px] left-0 right-0 bg-white border border-outline-variant rounded-lg shadow-xl z-50 overflow-hidden elevation-5">
                                    <ScrollView className="max-h-40" keyboardShouldPersistTaps="handled">
                                        <TouchableOpacity
                                            className="px-4 py-3 border-b border-surface-container-high active:bg-gray-100"
                                            onPress={() => {
                                                setSearchIndigena("1 Wayuu");
                                                setIsListOpen(false);
                                            }}
                                        >
                                            <Text className="text-on-surface font-body-md">1 Wayuu</Text>
                                        </TouchableOpacity>
                                        <View className="px-4 py-3">
                                            <Text className="text-on-surface-variant italic text-sm">Fin de los resultados</Text>
                                        </View>
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View className="flex flex-row gap-gutter mt-stack-lg mb-8">
                    <TouchableOpacity onPress={() => router.push('/registro/paso1')} className="flex-1 h-touch-target-min rounded-lg bg-surface-container-lowest border border-outline flex items-center justify-center">
                        <Text className="text-on-surface font-label-lg uppercase tracking-wide">Atrás</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/registro/paso3')} className="flex-1 h-touch-target-min rounded-lg bg-primary flex items-center justify-center">
                        <Text className="text-on-primary font-label-lg uppercase tracking-wide">Siguiente</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}