// front/app/(tabs)/pacientes/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PacientePerfilScreen() {
    const router = useRouter();
    // 1. Extraemos el ID exacto de la URL dinámica
    const { id } = useLocalSearchParams();

    const [activeTab, setActiveTab] = useState<'historial' | 'info'>('historial');
    const [perfil, setPerfil] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 2. Fetch directo al paciente y sus vacunas
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const res = await fetch(`http://localhost:3000/pacientes/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPerfil(data);
                }
            } catch (error) {
                console.error('Error fetching perfil:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    if (!perfil) {
        return <Text className="mt-10 text-center text-red-500">Paciente no encontrado</Text>;
    }

    const { paciente, historial } = perfil;

    return (
        <View className="flex-1 bg-gray-50">
            {/* TopAppBar y resto de UI... */}

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Cabecera dinámica */}
                <View className="bg-white px-5 py-6 items-center border-b border-gray-200">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                        {paciente.nombre} {paciente.apellido}
                    </Text>

                    <View className="flex-row flex-wrap justify-center items-center gap-2 mb-4">
                        <View className="bg-gray-100 py-1 px-3 rounded-full">
                            <Text className="text-gray-700 font-medium">{paciente.nacionalidad}-{paciente.cedula}</Text>
                        </View>
                        <View className="bg-gray-100 py-1 px-3 rounded-full">
                            <Text className="text-gray-700 font-medium">{paciente.sexo}</Text>
                        </View>
                    </View>
                </View>

                {/* Área de Contenido */}
                <View className="px-5 py-6">
                    {activeTab === 'historial' ? (
                        <View className="pl-2">
                            <View className="border-l-2 border-gray-200 ml-2 space-y-6 pb-6">
                                {/* Renderizamos el historial dinámico */}
                                {historial.map((vacuna: any) => (
                                    <View key={vacuna.id} className="relative pl-6 mb-4">
                                        <View className="absolute -left-[11px] top-1 w-5 h-5 bg-teal-700 rounded-full border-4 border-gray-50" />
                                        <View className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                            <View className="flex-row justify-between items-start mb-2">
                                                <Text className="font-bold text-gray-900 text-base">{vacuna.biologico_nombre}</Text>
                                                <View className="bg-gray-100 px-2 py-1 rounded">
                                                    <Text className="text-gray-600 text-xs font-medium">{vacuna.dosis_nombre}</Text>
                                                </View>
                                            </View>
                                            <View className="flex-row items-center gap-1 mb-3">
                                                <MaterialIcons name="calendar-today" size={14} color="#6b7280" />
                                                <Text className="text-gray-500 text-sm">{vacuna.fecha_aplicacion}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        // Sección Info (Aquí engancharíamos la lógica de Edición luego)
                        <View className="space-y-4">
                            {/* ... Info UI ... */}
                            <TouchableOpacity
                                // onPress={() => activarModoEdicion()} 
                                className="w-full h-12 mt-4 border border-teal-700 rounded-full flex-row items-center justify-center gap-2 bg-white"
                            >
                                <MaterialIcons name="edit" size={20} color="#008080" />
                                <Text className="text-teal-700 font-semibold text-base">Editar Datos Personales</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}