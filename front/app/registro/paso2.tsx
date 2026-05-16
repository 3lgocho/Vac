import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Switch, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ETNIAS_INDIGENAS, EtniaItem } from '../../constants/etnias';

export default function Paso2() {
    const router = useRouter();
    const [etnia, setEtnia] = useState<string>('');
    const [etniaLabel, setEtniaLabel] = useState<string>('');
    const [esIndigena, setEsIndigena] = useState(false);
    const [searchIndigena, setSearchIndigena] = useState('');
    const [isListOpen, setIsListOpen] = useState(false);

    // Nuevos estados para Fecha y Edad
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [edad, setEdad] = useState('-- años');

    // Función para aplicar la máscara DD/MM/AAAA
    const handleDateChange = (text: string) => {
        // 1. Eliminar cualquier carácter que no sea un número
        let cleaned = text.replace(/\D/g, '');

        // 2. Aplicar el formato DD/MM/AAAA
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
        }

        setFechaNacimiento(formatted);

        // 3. Calcular la edad si la fecha está completa (10 caracteres)
        if (formatted.length === 10) {
            calcularEdad(formatted);
        } else {
            setEdad('-- años'); // Reiniciar si borran la fecha
        }
    };

    // Función para calcular la edad exacta
    const calcularEdad = (fecha: string) => {
        const [dia, mes, anio] = fecha.split('/');
        const fechaNac = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
        const hoy = new Date();

        // Validar que la fecha sea lógica
        if (isNaN(fechaNac.getTime()) || fechaNac > hoy) {
            setEdad('Fecha inválida');
            return;
        }

        let ageYears = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();

        // Ajustar si aún no ha cumplido años este año
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
            ageYears--;
        }

        if (ageYears > 0) {
            setEdad(`${ageYears} años`);
        } else {
            // Si es menor a 1 año, calcular en meses (útil para vacunas)
            let ageMonths = (hoy.getFullYear() - fechaNac.getFullYear()) * 12 + (hoy.getMonth() - fechaNac.getMonth());
            if (hoy.getDate() < fechaNac.getDate()) {
                ageMonths--;
            }

            if (ageMonths > 0) {
                setEdad(`${ageMonths} meses`);
            } else {
                setEdad('Días de nacido');
            }
        }
    };

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

                {/* Datos Personales Section */}
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Datos Personales</Text>
                    <View className="flex flex-col gap-4 mb-stack-md">
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Fecha de Nacimiento</Text>
                            <TextInput
                                className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 font-body-md text-on-surface bg-surface-container-lowest"
                                placeholder="DD/MM/AAAA"
                                keyboardType="numeric" // <-- Despliega el teclado numérico directamente
                                maxLength={10} // <-- Evita que escriban más de 10 caracteres
                                value={fechaNacimiento}
                                onChangeText={handleDateChange}
                            />
                        </View>
                        <View className="flex flex-col gap-unit">
                            <Text className="font-label-lg text-on-surface-variant mb-1">Edad</Text>
                            <TextInput
                                className="h-touch-target-min w-full rounded-lg border border-outline-variant px-4 bg-surface-container-low text-on-surface-variant font-body-md"
                                value={edad}
                                editable={false} // <-- Completamente bloqueado para el usuario
                            />
                        </View>
                    </View>
                </View>

                {/* Dirección Section */}
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
                {/* Etnia Section */}
                <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-stack-lg mb-stack-lg z-10">
                    <Text className="font-headline-sm text-on-surface mb-stack-md">Etnia</Text>

                    {/* Mostrar los botones de Etnia general SOLO si el switch está apagado */}
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
                                    setEtnia(''); // Limpia la selección si se apaga
                                }
                            }}
                            trackColor={{ false: "#D1D5DB", true: "#008080" }}
                            thumbColor={esIndigena ? "#FFFFFF" : "#F3F4F6"}
                        />
                    </View>

                    {/* Botón que simula un Input para abrir el Modal */}
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
                    {/* Fondo oscuro translúcido */}
                    <View className="flex-1 justify-end bg-black/50">
                        {/* Contenedor del buscador (Bottom Sheet) */}
                        <View className="bg-surface-container-lowest h-[80%] rounded-t-3xl p-6 shadow-xl">

                            {/* Header del Modal */}
                            <View className="flex flex-row justify-between items-center mb-4">
                                <Text className="font-headline-sm text-on-surface">Buscar Etnia</Text>
                                <TouchableOpacity onPress={() => setIsListOpen(false)} className="p-2">
                                    <MaterialIcons name="close" size={24} color="#1F2937" />
                                </TouchableOpacity>
                            </View>

                            {/* Input real de búsqueda dentro del modal */}
                            <View className="flex flex-row items-center border border-primary rounded-lg bg-surface-container-low px-3 mb-4">
                                <MaterialIcons name="search" size={20} color="#008080" />
                                <TextInput
                                    autoFocus={true} // El teclado se abre solo al abrir el modal
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

                            {/* Lista nativa (FlatList no entra en conflicto con el ScrollView principal) */}
                            {/* Lista nativa filtrada */}
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
                                                setEtnia(item.value);       // Guarda "wayuu" (lo que va a Rust/Postgres)
                                                setEtniaLabel(item.label);  // Guarda "39 Wayúu (GuaSample)" (lo que ve la UI)
                                                setIsListOpen(false);       // Cierra el modal
                                                setSearchIndigena('');      // Limpia el buscador
                                            }}
                                        >
                                            <Text className="text-on-surface font-body-lg">{item.label}</Text>
                                        </TouchableOpacity>
                                    ))}

                                {/* Mensaje en caso de que escriban algo que no exista */}
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
        </SafeAreaView>
    );
}