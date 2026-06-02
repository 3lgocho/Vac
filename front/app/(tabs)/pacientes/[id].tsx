import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { TopBar } from '../../../components/TopBar';
import { apiFetch } from '../../../hooks/useApi';

type TabType = 'historial' | 'alergias' | 'datos';

const parseDateToFrontend = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
};

const ETIQUETAS_GRUPOS: Record<string, string> = {
    contingentes_militares: 'Contingentes Militares',
    embarazadas: 'Embarazadas',
    enfermos_cronicos: 'Enfermos Crónicos',
    personal_de_salud: 'Personal de Salud',
    pacientes_en_dialisis: 'Pacientes en Diálisis',
    privados_de_libertad: 'Privados de Libertad',
    trabajadores_avicolas: 'Trabajadores Avícolas',
    trabajadores_sexuales: 'Trabajadores Sexuales',
    viajeros_internacionales: 'Viajeros Internac.',
    otro: 'Otro',
};

export default function PacientePerfilScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('historial');
    const [perfil, setPerfil] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchPerfil = async () => {
                try {
                    const res = await apiFetch(`/pacientes/${id}`);
                    if (res.ok) {
                        setPerfil(await res.json());
                    }
                } catch (error) {
                    console.error('Error fetching perfil:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPerfil();
        }, [id])
    );

    if (loading) {
        return (
                    <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    if (!perfil) {
        return <Text className="mt-10 text-center text-error">Paciente no encontrado</Text>;
    }

    const { paciente, historial, alergias } = perfil;

    const gruposArray: string[] = paciente.grupos_especiales
        ? (typeof paciente.grupos_especiales === 'string'
            ? JSON.parse(paciente.grupos_especiales)
            : paciente.grupos_especiales)
        : [];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <TopBar
                title="Perfil del Paciente"
                onBack={() => router.back()}
                rightSlot={
                    <TouchableOpacity onPress={() => router.push(`/pacientes/editar/${id}` as any)}>
                        <MaterialIcons name="edit" size={22} color="#008080" />
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Cabecera */}
                <View className="bg-surface-container-lowest px-5 py-6 items-center border-b border-surface-container-highest">
                    <View className="w-16 h-16 bg-background rounded-full items-center justify-center mb-3">
                        <Text className="text-primary font-bold text-2xl">
                            {paciente.nombre?.charAt(0)}{paciente.apellido?.charAt(0)}
                        </Text>
                    </View>
                    <Text className="font-headline-md text-base text-headline-md text-on-surface mb-1">
                        {paciente.nombre} {paciente.apellido}
                    </Text>
                    <View className="flex-row flex-wrap justify-center items-center gap-2">
                        <View className="bg-surface-container-low py-1 px-3 rounded-full">
                            <Text className="text-on-surface-variant font-body-md">
                                {paciente.nacionalidad}-{paciente.cedula}
                            </Text>
                        </View>
                        <View className="bg-surface-container-low py-1 px-3 rounded-full">
                            <Text className="text-on-surface-variant font-body-md">
                                {paciente.genero}
                            </Text>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row w-full border border-outline-variant/50 mt-4 bg-surface-container-low rounded-lg p-1">
                        {(['historial', 'alergias', 'datos'] as TabType[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`flex-1 py-2 items-center justify-center rounded-md ${activeTab === tab ? 'bg-surface-container-lowest border border-outline-variant/50' : ''}`}
                                style={activeTab === tab ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 } : {}}
                            >
                                <Text className={`font-label-lg font-semibold capitalize ${activeTab === tab ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                                    {tab === 'datos' ? 'Datos' : tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="px-5 py-6 pb-24">
                    {/* TAB: HISTORIAL */}
                    {activeTab === 'historial' && (
                        <View className="pl-2">
                            {historial.length === 0 ? (
                                <View className="items-center py-10">
                                    <MaterialIcons name="vaccines" size={48} color="#D1D5DB" />
                                    <Text className="text-on-surface-variant font-body-md mt-3">No hay vacunas registradas.</Text>
                                </View>
                            ) : (
                                <View className="border-l-2 border-outline-variant ml-2 space-y-6 pb-6">
                                    {historial.map((vacuna: any) => (
                                        <View key={vacuna.id} className="relative pl-6 mb-4">
                                            <View className="absolute -left-[11px] top-1 w-5 h-5 bg-primary rounded-full border-4 border-surface" />
                                            <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 }}>
                                                <View className="flex-row justify-between items-start mb-2">
                                                    <Text className="font-label-lg text-label-lg text-on-surface">{vacuna.biologico_nombre}</Text>
                                                    <View className="bg-primary px-2 py-1 rounded">
                                                        <Text className="text-white font-body-sm">{vacuna.dosis_nombre}</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center gap-1">
                                                    <MaterialIcons name="calendar-today" size={16} color="#6b7280" />
                                                    <Text className="text-on-surface-variant font-body-sm">{vacuna.fecha_aplicacion}</Text>
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
                        <View>
                            {alergias.length === 0 ? (
                                <View className="items-center py-10">
                                    <MaterialIcons name="medical-information" size={48} color="#D1D5DB" />
                                    <Text className="text-on-surface-variant font-body-md mt-3">No hay alergias registradas.</Text>
                                </View>
                            ) : (
                                alergias.map((alergia: any) => (
                                    <View key={alergia.id} className="bg-error-container border border-error rounded-xl p-4 flex-row items-center gap-3 mb-3">
                                        <MaterialIcons name="warning" size={24} color="#B3261E" />
                                        <View className="flex-1">
                                            <Text className="font-label-lg text-on-error-container">{alergia.biologico_nombre}</Text>
                                            <Text className="text-on-error-container/70 font-body-sm">Registrada: {alergia.fecha_registro}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}

                    {/* TAB: DATOS */}
                    {activeTab === 'datos' && (
                        <View className="gap-4">
                            {/* Identidad */}
                            <View className="bg-surface-container-lowest rounded-xl border-b2 border-surface-container-highest p-4">
                                <View className="flex-row items-center mb-3">
                                    <MaterialIcons name="badge" size={20} color="#008080" />
                                    <Text className="font-label-lg text-label-lg text-on-surface ml-2">Identidad</Text>
                                </View>
                                <View className="gap-3">
                                    <InfoRow label="Nombre Completo" value={`${paciente.nombre} ${paciente.apellido}`} />
                                    <InfoRow label="Cédula" value={`${paciente.nacionalidad}-${paciente.cedula}`} />
                                    <InfoRow label="Fecha de Nacimiento" value={parseDateToFrontend(paciente.fecha_nacimiento)} />
                                    <InfoRow label="Género" value={paciente.genero} />
                                    <InfoRow label="Orden de Hijo" value={paciente.orden_hijo ? `Hijo #${paciente.orden_hijo}` : 'No registrado'} />
                                </View>
                            </View>

                            {/* Contacto y Residencia */}
                            <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4">
                                <View className="flex-row items-center mb-3">
                                    <MaterialIcons name="location-on" size={20} color="#008080" />
                                    <Text className="font-label-lg text-label-lg text-on-surface ml-2">Contacto y Residencia</Text>
                                </View>
                                <View className="gap-3">
                                    <InfoRow label="Teléfono" value={paciente.telefono || 'No registrado'} />
                                    <InfoRow
                                        label="Dirección"
                                        value={[paciente.direccion_comunidad, paciente.direccion_calle, paciente.direccion_casa]
                                            .filter(Boolean)
                                            .join(', ') || 'No registrada'}
                                    />
                                </View>
                            </View>

                            {/* Etnia */}
                            <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4">
                                <View className="flex-row items-center mb-3">
                                    <MaterialIcons name="public" size={20} color="#008080" />
                                    <Text className="font-label-lg text-label-lg text-on-surface ml-2">Etnia</Text>
                                </View>
                                <InfoRow label="" value={paciente.etnia || 'No pertenece a ninguna etnia'} />
                            </View>

                            {/* Grupos Especiales */}
                            <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4">
                                <View className="flex-row items-center mb-3">
                                    <MaterialIcons name="group" size={20} color="#008080" />
                                    <Text className="font-label-lg text-label-lg text-on-surface ml-2">Grupos Especiales</Text>
                                </View>
                                {gruposArray.length === 0 ? (
                                    <Text className="text-on-surface-variant font-body-md">Ninguno registrado</Text>
                                ) : (
                                    <View className="flex-row flex-wrap gap-2">
                                        {gruposArray.map((g: string) => (
                                            <View key={g} className="bg-primary-container py-1 px-3 rounded-full">
                                                <Text className="text-white font-body-md font-medium">{ETIQUETAS_GRUPOS[g] || g}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB: Vacunar */}
            {activeTab === 'historial' && (
                <TouchableOpacity
                    onPress={() => router.push(`/pacientes/vacunar/${id}` as any)}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center"
                    style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                >
                    <MaterialIcons name="add" size={30} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View>
            <View className="h-px bg-surface-container-high mb-1.5" />
            <Text className="text-on-surface-variant font-title-md capitalize mb-0.5">{label}</Text>
            <Text className="text-black font-body-md mt-0.5">{value}</Text>
        </View>
    );
}
