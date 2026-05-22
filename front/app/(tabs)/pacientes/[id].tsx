import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

type TabType = 'historial' | 'alergias' | 'info';

export default function PacientePerfilScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [activeTab, setActiveTab] = useState<TabType>('historial');
    const [perfil, setPerfil] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    const { paciente, historial, alergias } = perfil;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header / Top Bar Dinámico */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Perfil del Paciente</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Cabecera dinámica (Nombre y Cédula) */}
                <View className="bg-white px-5 py-6 items-center border-b border-gray-200">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                        {paciente.nombre} {paciente.apellido}
                    </Text>
                    <View className="flex-row flex-wrap justify-center items-center gap-2 mb-4">
                        <View className="bg-gray-100 py-1 px-3 rounded-full">
                            <Text className="text-gray-700 font-medium">{paciente.nacionalidad}-{paciente.cedula}</Text>
                        </View>
                        <View className="bg-gray-100 py-1 px-3 rounded-full">
                            <Text className="text-gray-700 font-medium">
                                {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                            </Text>
                        </View>
                    </View>

                    {/* Controles de Pestañas (Tabs) */}
                    <View className="flex-row w-full mt-4 bg-gray-100 rounded-lg p-1">
                        {(['historial', 'alergias', 'info'] as TabType[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`flex-1 py-2 rounded-md items-center ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`font-semibold capitalize ${activeTab === tab ? 'text-teal-700' : 'text-gray-500'}`}>
                                    {tab === 'info' ? 'Datos' : tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Área de Contenido */}
                <View className="px-5 py-6 pb-24">
                    {/* TAB: HISTORIAL */}
                    {activeTab === 'historial' && (
                        <View className="pl-2">
                            {historial.length === 0 ? (
                                <Text className="text-gray-500 text-center mt-4">No hay vacunas registradas.</Text>
                            ) : (
                                <View className="border-l-2 border-gray-200 ml-2 space-y-6 pb-6">
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
                            )}
                        </View>
                    )}

                    {/* TAB: ALERGIAS */}
                    {activeTab === 'alergias' && (
                        <View className="space-y-4">
                            {alergias.length === 0 ? (
                                <Text className="text-gray-500 text-center mt-4">No hay alergias registradas.</Text>
                            ) : (
                                alergias.map((alergia: any) => (
                                    <View key={alergia.id} className="bg-red-50 border border-red-200 rounded-lg p-4 flex-row items-center gap-3">
                                        <MaterialIcons name="warning" size={24} color="#dc2626" />
                                        <View>
                                            <Text className="font-bold text-red-900">{alergia.biologico_nombre}</Text>
                                            <Text className="text-red-700 text-sm">Registrada: {alergia.fecha_registro}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}

                    {/* TAB: DATOS PERSONALES */}
                    {activeTab === 'info' && (
                        <View className="space-y-4">
                            <View className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                <View>
                                    <Text className="text-gray-500 text-xs uppercase tracking-wider">Fecha de Nacimiento</Text>
                                    <Text className="text-gray-900 font-medium">{paciente.fecha_nacimiento}</Text>
                                </View>
                                <View className="h-[1px] bg-gray-100" />
                                <View>
                                    <Text className="text-gray-500 text-xs uppercase tracking-wider">Teléfono</Text>
                                    <Text className="text-gray-900 font-medium">{paciente.telefono || 'No registrado'}</Text>
                                </View>
                                <View className="h-[1px] bg-gray-100" />
                                <View>
                                    <Text className="text-gray-500 text-xs uppercase tracking-wider">Correo</Text>
                                    <Text className="text-gray-900 font-medium">{paciente.correo || 'No registrado'}</Text>
                                </View>
                                <View className="h-[1px] bg-gray-100" />
                                <View>
                                    <Text className="text-gray-500 text-xs uppercase tracking-wider">Dirección</Text>
                                    <Text className="text-gray-900 font-medium">
                                        {paciente.direccion_comunidad}, {paciente.direccion_calle}, {paciente.direccion_casa}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => router.push(`/pacientes/editar/${id}` as any)}
                                className="w-full h-12 mt-4 border border-teal-700 rounded-full flex-row items-center justify-center gap-2 bg-white"
                            >
                                <MaterialIcons name="edit" size={20} color="#008080" />
                                <Text className="text-teal-700 font-semibold text-base">Editar Datos del Paciente</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button (FAB) */}
            {activeTab === 'historial' && (
                <TouchableOpacity
                    onPress={() => router.push(`/pacientes/vacunar/${id}` as any)}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-teal-700 rounded-full items-center justify-center shadow-lg elevation-5"
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}