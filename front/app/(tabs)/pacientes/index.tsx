import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PacientesScreen() {
    const router = useRouter();

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
                    <TouchableOpacity className="px-4 py-1.5 rounded-full bg-white border border-gray-200 mr-2">
                        <Text className="text-gray-600 font-medium text-xs">Completados</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Main Canvas: Patient List */}
            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Patient Card 1: Completado */}
                <TouchableOpacity
                    onPress={() => router.push('/pacientes/123')}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center gap-3 mb-3 shadow-sm"
                >
                    <View className="w-12 h-12 rounded-full bg-teal-50 items-center justify-center shrink-0">
                        <Text className="text-teal-700 font-bold text-lg">MR</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>Maria Rodriguez</Text>
                        <Text className="text-gray-500 text-sm">V-12.345.678</Text>
                    </View>
                    <View className="items-end gap-1">
                        <View className="bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                            <Text className="text-teal-700 text-xs font-medium">Esquema Completo</Text>
                        </View>
                        <Text className="text-gray-400 text-xs">Hace 2 días</Text>
                    </View>
                </TouchableOpacity>

                {/* Patient Card 2: Pendiente */}
                <TouchableOpacity
                    onPress={() => router.push('/pacientes/124')}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center gap-3 mb-3 shadow-sm"
                >
                    {/* Reemplazo de foto por iniciales */}
                    <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center shrink-0">
                        <Text className="text-blue-700 font-bold text-lg">CM</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>Carlos Mendoza</Text>
                        <Text className="text-gray-500 text-sm">V-08.912.345</Text>
                    </View>
                    <View className="items-end gap-1">
                        <View className="bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                            <Text className="text-gray-700 text-xs font-medium">Pendiente Dosis 2</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <MaterialIcons name="warning" size={14} color="#dc2626" />
                            <Text className="text-red-600 text-xs font-medium">Atrasado</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}