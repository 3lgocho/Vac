import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

type TabType = 'historial' | 'alergias' | 'info';

// Helpers para manejar fechas entre el Back (YYYY-MM-DD) y Front (DD/MM/YYYY)
const parseDateToFrontend = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
};

const parseDateToBackend = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
};

export default function PacientePerfilScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [activeTab, setActiveTab] = useState<TabType>('historial');
    const [perfil, setPerfil] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Estados para la edición en línea
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

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

    const toggleEdit = () => {
        if (!isEditing) {
            // Inicializar copia temporal sin modificar la original
            setEditForm({
                nombre: perfil.paciente.nombre || '',
                apellido: perfil.paciente.apellido || '',
                cedula: perfil.paciente.cedula || '',
                sexo: perfil.paciente.sexo || 'M',
                fecha_nacimiento: parseDateToFrontend(perfil.paciente.fecha_nacimiento),
                telefono: perfil.paciente.telefono || '',
                direccion_comunidad: perfil.paciente.direccion_comunidad || '',
                direccion_calle: perfil.paciente.direccion_calle || '',
                direccion_casa: perfil.paciente.direccion_casa || ''
            });
            setActiveTab('info'); // Forzar la vista de datos al editar
        }
        setIsEditing(!isEditing);
    };

    const handleDateChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
        }
        setEditForm({ ...editForm, fecha_nacimiento: formatted });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...editForm,
                fecha_nacimiento: parseDateToBackend(editForm.fecha_nacimiento),
                correo: null // Forzamos null ya que se eliminará
            };

            const res = await fetch(`http://localhost:3000/pacientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Actualizar el perfil original para reflejar en pantalla
                setPerfil({
                    ...perfil,
                    paciente: {
                        ...perfil.paciente,
                        ...payload
                    }
                });
                setIsEditing(false);
                Alert.alert("Éxito", "Los datos del paciente han sido actualizados.");
            } else {
                Alert.alert("Error", "No se pudo actualizar el paciente.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Hubo un problema de conexión al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

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
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2" disabled={isEditing}>
                    <MaterialIcons name="arrow-back" size={24} color={isEditing ? "#9ca3af" : "#374151"} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">
                    {isEditing ? 'Editando Paciente' : 'Perfil del Paciente'}
                </Text>

                {/* Controles de Edición Superiores */}
                <View className="flex-row items-center w-16 justify-end">
                    {isEditing ? (
                        <>
                            <TouchableOpacity onPress={toggleEdit} className="p-1 mr-2" disabled={isSaving}>
                                <MaterialIcons name="close" size={24} color="#ef4444" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} className="p-1" disabled={isSaving}>
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#10b981" />
                                ) : (
                                    <MaterialIcons name="check" size={24} color="#10b981" />
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={toggleEdit} className="p-1">
                            <MaterialIcons name="edit" size={22} color="#008080" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Cabecera dinámica (Se oculta al editar para evitar doble información) */}
                {!isEditing && (
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

                        {/* Controles de Pestañas */}
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
                )}

                {/* Área de Contenido */}
                <View className="px-5 py-6 pb-24">
                    {/* TAB: HISTORIAL */}
                    {activeTab === 'historial' && !isEditing && (
                        <View className="pl-2">
                            {historial.length === 0 ? (
                                <Text className="text-gray-500 text-center mt-4">No hay vacunas registradas.</Text>
                            ) : (
                                <View className="border-l-2 border-gray-200 ml-2 space-y-6 pb-6">
                                    {historial.map((vacuna: any) => (
                                        <View key={vacuna.id} className="relative pl-6 mb-4">
                                            <View className="absolute -left-[11px] top-1 w-5 h-5 bg-teal-700 rounded-full border-4 border-gray-50" />
                                            <View className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
                                                <View className="flex-row justify-between items-start mb-2">
                                                    <Text className="font-bold text-gray-900 text-lg">{vacuna.biologico_nombre}</Text>
                                                    <View className="bg-blue-100 px-2 py-1 rounded">
                                                        <Text className="text-blue-800 text-sm font-medium">{vacuna.dosis_nombre}</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center gap-1 mb-3">
                                                    <MaterialIcons name="calendar-today" size={18} color="#6b7280" />
                                                    <Text className="text-gray-500 text-base">{vacuna.fecha_aplicacion}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* TAB: ALERGIAS */}
                    {activeTab === 'alergias' && !isEditing && (
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

                    {/* TAB: DATOS PERSONALES (Formulario y Vista de Cards) */}
                    {(activeTab === 'info' || isEditing) && (
                        <View className="space-y-5">

                            {/* CARD 1: IDENTIDAD */}
                            <View className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                <View className="flex-row items-center mb-2">
                                    <MaterialIcons name="badge" size={20} color="#008080" />
                                    <Text className="text-teal-700 font-bold ml-2 text-base">Identidad</Text>
                                </View>

                                {isEditing ? (
                                    <View className="space-y-4">
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Nombres</Text>
                                            <TextInput
                                                value={editForm.nombre}
                                                onChangeText={(t) => setEditForm({ ...editForm, nombre: t })}
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Apellidos</Text>
                                            <TextInput
                                                value={editForm.apellido}
                                                onChangeText={(t) => setEditForm({ ...editForm, apellido: t })}
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Cédula</Text>
                                            <TextInput
                                                value={editForm.cedula}
                                                onChangeText={(t) => setEditForm({ ...editForm, cedula: t.replace(/\D/g, '') })}
                                                keyboardType="numeric"
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Fecha de Nacimiento (DD/MM/YYYY)</Text>
                                            <TextInput
                                                value={editForm.fecha_nacimiento}
                                                onChangeText={handleDateChange}
                                                keyboardType="numeric"
                                                maxLength={10}
                                                placeholder="DD/MM/YYYY"
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Sexo</Text>
                                            <View className="flex-row gap-2 mt-1">
                                                <TouchableOpacity
                                                    onPress={() => setEditForm({ ...editForm, sexo: 'M' })}
                                                    className={`flex-1 py-2 rounded-md border items-center ${editForm.sexo === 'M' ? 'bg-teal-50 border-teal-500' : 'bg-gray-50 border-gray-300'}`}
                                                >
                                                    <Text className={editForm.sexo === 'M' ? 'text-teal-700 font-bold' : 'text-gray-500'}>Masculino</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => setEditForm({ ...editForm, sexo: 'F' })}
                                                    className={`flex-1 py-2 rounded-md border items-center ${editForm.sexo === 'F' ? 'bg-teal-50 border-teal-500' : 'bg-gray-50 border-gray-300'}`}
                                                >
                                                    <Text className={editForm.sexo === 'F' ? 'text-teal-700 font-bold' : 'text-gray-500'}>Femenino</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="space-y-3">
                                        <View>
                                            <Text className="text-gray-500 text-xs uppercase tracking-wider">Nombre Completo</Text>
                                            <Text className="text-gray-900 font-medium">{paciente.nombre} {paciente.apellido}</Text>
                                        </View>
                                        <View className="h-[1px] bg-gray-100" />
                                        <View>
                                            <Text className="text-gray-500 text-xs uppercase tracking-wider">Cédula</Text>
                                            <Text className="text-gray-900 font-medium">{paciente.nacionalidad}-{paciente.cedula}</Text>
                                        </View>
                                        <View className="h-[1px] bg-gray-100" />
                                        <View>
                                            <Text className="text-gray-500 text-xs uppercase tracking-wider">Fecha de Nacimiento</Text>
                                            <Text className="text-gray-900 font-medium">{parseDateToFrontend(paciente.fecha_nacimiento)}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Teléfono</Text>
                                            <Text className="text-gray-900 font-medium">{paciente.telefono || 'No registrado'}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* CARD 2: CONTACTO Y RESIDENCIA */}
                            <View className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                <View className="flex-row items-center mb-2">
                                    <MaterialIcons name="contact-phone" size={20} color="#008080" />
                                    <Text className="text-teal-700 font-bold ml-2 text-base">Contacto y Residencia</Text>
                                </View>

                                {isEditing ? (
                                    <View className="space-y-4">
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Teléfono</Text>
                                            <TextInput
                                                value={editForm.telefono}
                                                onChangeText={(t) => setEditForm({ ...editForm, telefono: t.replace(/\D/g, '') })}
                                                keyboardType="numeric"
                                                maxLength={11}
                                                placeholder="04141234567"
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Comunidad</Text>
                                            <TextInput
                                                value={editForm.direccion_comunidad}
                                                onChangeText={(t) => setEditForm({ ...editForm, direccion_comunidad: t })}
                                                placeholder="Ej. Urb. Los Sauces"
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Calle / Avenida</Text>
                                            <TextInput
                                                value={editForm.direccion_calle}
                                                onChangeText={(t) => setEditForm({ ...editForm, direccion_calle: t })}
                                                placeholder="Ej. Av. Principal"
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-gray-500 text-xs mb-1">Casa / Apartamento</Text>
                                            <TextInput
                                                value={editForm.direccion_casa}
                                                onChangeText={(t) => setEditForm({ ...editForm, direccion_casa: t })}
                                                placeholder="Ej. Casa 4A"
                                                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-gray-50"
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <View className="space-y-3">

                                        <View className="h-[1px] bg-gray-100" />
                                        <View>
                                            <Text className="text-gray-500 text-xs uppercase tracking-wider">Dirección</Text>
                                            <Text className="text-gray-900 font-medium">
                                                {[paciente.direccion_comunidad, paciente.direccion_calle, paciente.direccion_casa]
                                                    .filter(Boolean)
                                                    .join(', ') || 'No registrada'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* CARD 3: OTROS DATOS */}
                            <View className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 opacity-90">
                                <View className="flex-row items-center mb-2">
                                    <MaterialIcons name="info" size={20} color="#008080" />
                                    <Text className="text-teal-700 font-bold ml-2 text-base">Otros Datos</Text>
                                </View>

                                <View>
                                    <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">Etnia</Text>
                                    <View className="bg-gray-100 rounded-md px-3 py-2 border border-gray-200">
                                        <Text className="text-gray-500 italic">{paciente.etnia || 'No pertenece a ninguna etnia / No registrado'}</Text>
                                    </View>
                                    {isEditing && (
                                        <Text className="text-xs text-gray-400 mt-1 ml-1">
                                            * La edición de etnia estará disponible próximamente.
                                        </Text>
                                    )}
                                </View>
                            </View>

                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button (Oculto en modo edición) */}
            {activeTab === 'historial' && !isEditing && (
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