import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PacientePerfilScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'historial' | 'info'>('historial');

    return (
        <View className="flex-1 bg-gray-50">
            {/* TopAppBar */}
            <View className="flex-row justify-between items-center px-5 pt-14 pb-4 bg-white border-b border-gray-200 z-50">
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#008080" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-teal-700">Perfil del Paciente</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full">
                    <MaterialIcons name="more-vert" size={24} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Encabezado Tipográfico Mejorado (Sin foto grande) */}
                <View className="bg-white px-5 py-6 items-center border-b border-gray-200">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">Andreina Doe</Text>

                    <View className="flex-row flex-wrap justify-center items-center gap-2 mb-4">
                        <View className="bg-gray-100 py-1 px-3 rounded-full">
                            <Text className="text-gray-700 font-medium">V-12.345.678</Text>
                        </View>
                        <View className="bg-gray-100 py-1 px-3 rounded-full">
                            <Text className="text-gray-700 font-medium">28 años • Femenino</Text>
                        </View>
                        <View className="bg-red-50 py-1 px-3 rounded-full flex-row items-center gap-1 border border-red-100">
                            <MaterialIcons name="bloodtype" size={14} color="#dc2626" />
                            <Text className="text-red-600 font-bold text-sm">O+</Text>
                        </View>
                    </View>
                </View>

                {/* Tarjeta de Alerta Médica Crítica */}
                <View className="px-5 mt-4">
                    <View className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row gap-3 shadow-sm">
                        <MaterialIcons name="warning" size={24} color="#dc2626" />
                        <View className="flex-1">
                            <Text className="text-red-800 font-bold text-base">Alerta: Alergias a Biológicos</Text>
                            <Text className="text-red-700 text-sm mt-1 leading-5">
                                Reacción anafiláctica severa a derivados del huevo y neomicina.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tab Navigation */}
                <View className="flex-row bg-white mt-4 border-b border-gray-200">
                    <TouchableOpacity
                        className={`flex-1 py-4 border-b-2 ${activeTab === 'historial' ? 'border-teal-700' : 'border-transparent'}`}
                        onPress={() => setActiveTab('historial')}
                    >
                        <Text className={`text-center font-semibold ${activeTab === 'historial' ? 'text-teal-700' : 'text-gray-500'}`}>
                            Historial de Vacunas
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-4 border-b-2 ${activeTab === 'info' ? 'border-teal-700' : 'border-transparent'}`}
                        onPress={() => setActiveTab('info')}
                    >
                        <Text className={`text-center font-semibold ${activeTab === 'info' ? 'text-teal-700' : 'text-gray-500'}`}>
                            Info. Personal
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content Area */}
                <View className="px-5 py-6">
                    {activeTab === 'historial' ? (
                        <View className="pl-2">
                            {/* Timeline Line */}
                            <View className="border-l-2 border-gray-200 ml-2 space-y-6 pb-6">

                                {/* Vaccine Item 1 */}
                                <View className="relative pl-6">
                                    <View className="absolute -left-[11px] top-1 w-5 h-5 bg-teal-700 rounded-full border-4 border-gray-50" />
                                    <View className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <Text className="font-bold text-gray-900 text-base">COVID-19</Text>
                                            <View className="bg-gray-100 px-2 py-1 rounded">
                                                <Text className="text-gray-600 text-xs font-medium">Refuerzo</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center gap-1 mb-3">
                                            <MaterialIcons name="calendar-today" size={14} color="#6b7280" />
                                            <Text className="text-gray-500 text-sm">15 Oct 2023</Text>
                                        </View>
                                        <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                                            <View className="flex-1">
                                                <Text className="text-gray-400 text-xs">Lote</Text>
                                                <Text className="text-gray-800 text-sm mt-0.5">PZ-9901A</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-400 text-xs">Vacunador</Text>
                                                <Text className="text-gray-800 text-sm mt-0.5">Dra. M. Silva</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Añade más items del timeline aquí siguiendo la misma estructura */}

                            </View>
                        </View>
                    ) : (
                        <View className="space-y-4">
                            {/* Section: Contacto */}
                            <View className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <Text className="font-bold text-teal-700 mb-3 border-b border-gray-100 pb-2">Contacto y Ubicación</Text>
                                <View className="space-y-3">
                                    <View>
                                        <Text className="text-gray-400 text-xs mb-1">Dirección Residencial</Text>
                                        <Text className="text-gray-800 text-sm">Av. Principal de Altamira, Edif. Centro, Apto 4B.</Text>
                                        <Text className="text-gray-500 text-sm">Caracas, Miranda. Zona Postal 1060.</Text>
                                    </View>
                                    <View className="pt-2 border-t border-gray-100">
                                        <Text className="text-gray-400 text-xs mb-1">Teléfono Principal</Text>
                                        <Text className="text-gray-800 text-sm">+58 414-1234567</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Botón de Editar */}
                            <TouchableOpacity className="w-full h-12 mt-4 border border-teal-700 rounded-full flex-row items-center justify-center gap-2 bg-white">
                                <MaterialIcons name="edit" size={20} color="#008080" />
                                <Text className="text-teal-700 font-semibold text-base">Editar Datos Personales</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button (Solo visible en Historial) */}
            {activeTab === 'historial' && (
                <TouchableOpacity
                    className="absolute bottom-6 right-5 bg-teal-700 h-14 w-14 rounded-2xl items-center justify-center shadow-lg"
                    style={{ elevation: 5 }}
                >
                    <MaterialIcons name="add" size={28} color="#ffffff" />
                </TouchableOpacity>
            )}
        </View>
    );
}