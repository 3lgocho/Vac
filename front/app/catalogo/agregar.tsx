import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../hooks/useApi';

interface DosisForm {
    nombre_dosis: string;
    edad_recomendada_meses: string;
    intervalo_recomendado_meses: string;
    intervalo_minimo_meses: string;
    es_refuerzo: boolean;
    es_anual: boolean;
}

export default function AgregarCatalogoScreen() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [dosisList, setDosisList] = useState<DosisForm[]>([]);
    const [saving, setSaving] = useState(false);

    const agregarDosis = () => {
        setDosisList([...dosisList, {
            nombre_dosis: '',
            edad_recomendada_meses: '0',
            intervalo_recomendado_meses: '0',
            intervalo_minimo_meses: '0',
            es_refuerzo: false,
            es_anual: false
        }]);
    };

    const actualizarDosis = (index: number, field: keyof DosisForm, value: any) => {
        const nuevasDosis = [...dosisList];
        nuevasDosis[index] = { ...nuevasDosis[index], [field]: value };
        setDosisList(nuevasDosis);
    };

    const eliminarDosis = (index: number) => {
        setDosisList(dosisList.filter((_, i) => i !== index));
    };

    const handleGuardar = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre del biológico es requerido');
            return;
        }

        if (dosisList.length === 0) {
            Alert.alert('Error', 'Debe agregar al menos una dosis');
            return;
        }

        // Validate dosis
        for (let i = 0; i < dosisList.length; i++) {
            const d = dosisList[i];
            if (!d.nombre_dosis.trim()) {
                Alert.alert('Error', `La dosis ${i + 1} no tiene nombre (ej. 1D, 2D)`);
                return;
            }
        }

        const payload = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            dosis: dosisList.map((d, index) => ({
                nombre_dosis: d.nombre_dosis.trim(),
                orden_aplicacion: index + 1, // El orden es secuencial según como se agregaron
                edad_recomendada_meses: parseInt(d.edad_recomendada_meses) || 0,
                intervalo_recomendado_meses: parseInt(d.intervalo_recomendado_meses) || 0,
                intervalo_minimo_meses: parseInt(d.intervalo_minimo_meses) || 0,
                es_refuerzo: d.es_refuerzo,
                es_anual: d.es_anual
            }))
        };

        try {
            setSaving(true);
            await apiFetch('/biologicos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            Alert.alert('Éxito', 'Biológico y esquema guardados correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-surface-container-lowest">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-surface-container-low">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 rounded-full active:bg-surface-container">
                    <MaterialIcons name="arrow-back" size={24} color="#3e4949" />
                </TouchableOpacity>
                <Text className="font-headline-sm text-xl font-bold text-on-surface">Agregar Vacuna</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 p-5">
                    
                    <Text className="font-label-lg font-bold text-on-surface mb-2">Información del Biológico</Text>
                    
                    <View className="mb-4">
                        <Text className="font-label-md text-on-surface-variant mb-1">Nombre Comercial / Biológico *</Text>
                        <TextInput
                            className="bg-surface-container border border-outline-variant rounded-xl p-4 font-body-md text-on-surface"
                            placeholder="Ej. Hexavalente, Rotavirus"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="font-label-md text-on-surface-variant mb-1">Descripción</Text>
                        <TextInput
                            className="bg-surface-container border border-outline-variant rounded-xl p-4 font-body-md text-on-surface"
                            placeholder="Ej. DTPa + VHB + Hib + IPV"
                            multiline
                            numberOfLines={2}
                            value={descripcion}
                            onChangeText={setDescripcion}
                        />
                    </View>

                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="font-label-lg font-bold text-on-surface">Esquema de Dosis</Text>
                        <TouchableOpacity onPress={agregarDosis} className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-lg">
                            <MaterialIcons name="add" size={20} color="#005b52" />
                            <Text className="text-primary font-label-md ml-1 font-semibold">Añadir Dosis</Text>
                        </TouchableOpacity>
                    </View>

                    {dosisList.map((dosis, index) => (
                        <View key={index} className="bg-surface border border-outline-variant rounded-xl p-4 mb-4 relative shadow-sm">
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <Text className="text-white font-bold text-xs">{index + 1}</Text>
                                    </View>
                                    <Text className="font-label-lg font-semibold text-on-surface">Configuración de Dosis</Text>
                                </View>
                                <TouchableOpacity onPress={() => eliminarDosis(index)}>
                                    <MaterialIcons name="delete-outline" size={24} color="#ba1a1a" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row gap-3 mb-3">
                                <View className="flex-1">
                                    <Text className="font-label-md text-on-surface-variant mb-1 text-xs">Nombre Dosis *</Text>
                                    <TextInput
                                        className="bg-surface-container border border-outline-variant rounded-lg p-3 font-body-md"
                                        placeholder="1D, 2D, 1REF, DU"
                                        value={dosis.nombre_dosis}
                                        onChangeText={(v) => actualizarDosis(index, 'nombre_dosis', v)}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-label-md text-on-surface-variant mb-1 text-xs">Edad Recom. (Meses)</Text>
                                    <TextInput
                                        className="bg-surface-container border border-outline-variant rounded-lg p-3 font-body-md"
                                        placeholder="Meses"
                                        keyboardType="numeric"
                                        value={dosis.edad_recomendada_meses}
                                        onChangeText={(v) => actualizarDosis(index, 'edad_recomendada_meses', v.replace(/[^0-9]/g, ''))}
                                    />
                                </View>
                            </View>

                            <View className="flex-row gap-3 mb-4">
                                <View className="flex-1">
                                    <Text className="font-label-md text-on-surface-variant mb-1 text-xs">Int. Recom. (Meses)</Text>
                                    <TextInput
                                        className="bg-surface-container border border-outline-variant rounded-lg p-3 font-body-md"
                                        placeholder="Meses"
                                        keyboardType="numeric"
                                        value={dosis.intervalo_recomendado_meses}
                                        onChangeText={(v) => actualizarDosis(index, 'intervalo_recomendado_meses', v.replace(/[^0-9]/g, ''))}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-label-md text-on-surface-variant mb-1 text-xs">Int. Mínimo (Meses)</Text>
                                    <TextInput
                                        className="bg-surface-container border border-outline-variant rounded-lg p-3 font-body-md"
                                        placeholder="Meses"
                                        keyboardType="numeric"
                                        value={dosis.intervalo_minimo_meses}
                                        onChangeText={(v) => actualizarDosis(index, 'intervalo_minimo_meses', v.replace(/[^0-9]/g, ''))}
                                    />
                                </View>
                            </View>

                            <View className="flex-row gap-4 border-t border-outline-variant/30 pt-3">
                                <View className="flex-row items-center gap-2 flex-1">
                                    <Switch
                                        value={dosis.es_refuerzo}
                                        onValueChange={(v) => actualizarDosis(index, 'es_refuerzo', v)}
                                        trackColor={{ false: '#e5e7eb', true: '#005b52' }}
                                    />
                                    <Text className="font-label-md text-on-surface text-sm">Es Refuerzo</Text>
                                </View>
                                <View className="flex-row items-center gap-2 flex-1">
                                    <Switch
                                        value={dosis.es_anual}
                                        onValueChange={(v) => actualizarDosis(index, 'es_anual', v)}
                                        trackColor={{ false: '#e5e7eb', true: '#005b52' }}
                                    />
                                    <Text className="font-label-md text-on-surface text-sm">Es Anual</Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {dosisList.length === 0 && (
                        <View className="py-8 items-center bg-surface-container rounded-xl border border-dashed border-outline-variant">
                            <MaterialIcons name="vaccines" size={40} color="#9ca3af" />
                            <Text className="text-on-surface-variant font-body-md mt-2">No hay dosis configuradas</Text>
                        </View>
                    )}

                    <View className="h-20" />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer Buttons */}
            <View className="p-4 bg-surface-container-lowest border-t border-surface-container-low flex-row gap-3">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-1 py-4 items-center justify-center rounded-xl border border-outline-variant"
                >
                    <Text className="font-label-lg font-bold text-on-surface">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleGuardar}
                    disabled={saving}
                    className={`flex-1 py-4 items-center justify-center rounded-xl ${saving ? 'bg-primary/50' : 'bg-primary'}`}
                >
                    <Text className="font-label-lg font-bold text-on-primary">
                        {saving ? 'Guardando...' : 'Guardar Vacuna'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
