import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePacientes } from '../../../hooks/usePacientes';
import { PacienteCard } from '../../../components/PacienteCard';

export default function PacientesScreen() {
    const router = useRouter();
    // Consumimos el hook
    const { pacientes, loading, error } = usePacientes();

    return (
        <View className="flex-1 bg-gray-50">
            {/* TopAppBar */}
            <View className="flex-row justify-between items-center px-5 pt-14 pb-4 bg-white border-b border-gray-200">
                <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 items-center justify-center">
                        <Text className="text-teal-800 font-bold text-xs">US</Text>
                    </View>
                    <Text className="text-xl font-bold text-teal-700 tracking-tight">SISPAI-02</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-gray-50">
                    <MaterialIcons name="settings" size={24} color="#4b5563" />
                </TouchableOpacity>
            </View>

            {/* Sticky Search Header */}
            <View className="bg-white/95 px-5 py-4">
                <View className="flex-row gap-2 items-center">
                    <View className="flex-1 relative justify-center">
                        <MaterialIcons name="search" size={20} color="#6b7280" className="absolute left-3 z-10" />
                        <TextInput
                            className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-gray-900"
                            placeholder="Buscar paciente..."
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                    <TouchableOpacity className="h-12 w-12 rounded-lg border border-gray-200 bg-white items-center justify-center">
                        <MaterialIcons name="filter-list" size={24} color="#008080" />
                    </TouchableOpacity>
                </View>

                {/* Quick Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-3">
                    <TouchableOpacity className="px-4 py-1.5 rounded-full bg-teal-700 mr-2">
                        <Text className="text-white font-medium text-xs">Todos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-4 py-1.5 rounded-full bg-white border border-gray-200 mr-2">
                        <Text className="text-gray-600 font-medium text-xs">Pendientes</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Main Canvas: Patient List */}
            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#008080" className="mt-10" />
                ) : error ? (
                    <Text className="text-red-500 text-center mt-10">Error al cargar: {error}</Text>
                ) : pacientes.length === 0 ? (
                    <Text className="text-gray-500 text-center mt-10">No hay pacientes registrados aún.</Text>
                ) : (
                    pacientes.map((paciente) => (
                        <PacienteCard
                            key={paciente.id}
                            nombre={paciente.nombre}
                            apellido={paciente.apellido}
                            cedula={`${paciente.nacionalidad}-${paciente.cedula}`}
                            // Todo: Estos 3 campos necesitarán un JOIN en Rust para ser reales
                            vacuna="Por definir"
                            dosis="N/A"
                            esAtrasada={false}
                            onPress={() => router.push(`/pacientes/${paciente.id}`)}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}