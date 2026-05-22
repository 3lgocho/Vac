import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Componentes y Constantes
import ModalConfirmacionEdicion from '../../../../components/registro/modales/ModalConfirmacionEdicion';
import ModalExitoEdicion from '../../../../components/registro/modales/ModalExitoEdicion';
import { GRUPOS_ESPECIALES } from '../../../../constants/grupos_especiales';

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

export default function EditarPacienteScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Estados de Modales
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Estado local para el formulario (Independiente del estado global)
    const [editForm, setEditForm] = useState<any>({
        nombre: '', apellido: '', cedula: '', sexo: 'M',
        fecha_nacimiento: '', telefono: '', direccion_comunidad: '',
        direccion_calle: '', direccion_casa: '', etnia: '', grupos_especiales: []
    });

    useEffect(() => {
        const fetchPaciente = async () => {
            try {
                const res = await fetch(`http://localhost:3000/pacientes/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    const p = data.paciente;

                    // Asegurar que grupos_especiales sea un array al cargar
                    let gruposFormateados = [];
                    if (p.grupos_especiales) {
                        gruposFormateados = typeof p.grupos_especiales === 'string'
                            ? JSON.parse(p.grupos_especiales)
                            : p.grupos_especiales;
                    }

                    setEditForm({
                        nombre: p.nombre || '',
                        apellido: p.apellido || '',
                        cedula: p.cedula || '',
                        sexo: p.sexo || 'M',
                        fecha_nacimiento: parseDateToFrontend(p.fecha_nacimiento),
                        telefono: p.telefono || '',
                        direccion_comunidad: p.direccion_comunidad || '',
                        direccion_calle: p.direccion_calle || '',
                        direccion_casa: p.direccion_casa || '',
                        etnia: p.etnia || '',
                        grupos_especiales: gruposFormateados
                    });
                }
            } catch (error) {
                Alert.alert('Error', 'No se pudo cargar el paciente.');
            } finally {
                setLoading(false);
            }
        };
        fetchPaciente();
    }, [id]);

    const updateField = (field: string, value: any) => {
        setEditForm({ ...editForm, [field]: value });
        setIsDirty(true);
    };

    const handleDateChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
        updateField('fecha_nacimiento', formatted);
    };

    const toggleGrupoEspecial = (grupoValue: string) => {
        const currentGroups = editForm.grupos_especiales || [];
        const isSelected = currentGroups.includes(grupoValue);

        const newGroups = isSelected
            ? currentGroups.filter((g: string) => g !== grupoValue)
            : [...currentGroups, grupoValue];

        updateField('grupos_especiales', newGroups);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...editForm,
                fecha_nacimiento: parseDateToBackend(editForm.fecha_nacimiento),
                correo: null, // Forzado nulo según instrucciones
                grupos_especiales: editForm.grupos_especiales.length > 0 ? editForm.grupos_especiales : null
            };

            const res = await fetch(`http://localhost:3000/pacientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsDirty(false);
                setShowSuccessModal(true);
            } else {
                Alert.alert("Error", "No se pudo actualizar el paciente.");
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema de conexión al guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (isDirty) {
            setShowConfirmModal(true);
        } else {
            router.back();
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
                    <MaterialIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Editar Paciente</Text>
                <TouchableOpacity onPress={handleSave} disabled={isSaving} className="p-2 -mr-2">
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#008080" />
                    ) : (
                        <Text className="font-bold text-teal-700 text-base">Guardar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 py-6 pb-12" showsVerticalScrollIndicator={false}>

                {/* IDENTIDAD */}
                <View className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="person" size={22} color="#008080" />
                        <Text className="text-gray-900 font-bold ml-2 text-lg">Identidad</Text>
                    </View>
                    <View className="space-y-4">
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Nombres</Text>
                            <TextInput
                                value={editForm.nombre}
                                onChangeText={(t) => updateField('nombre', t)}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Apellidos</Text>
                            <TextInput
                                value={editForm.apellido}
                                onChangeText={(t) => updateField('apellido', t)}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Cédula</Text>
                            <TextInput
                                value={editForm.cedula}
                                onChangeText={(t) => updateField('cedula', t.replace(/\D/g, ''))}
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Fecha de Nacimiento</Text>
                            <TextInput
                                value={editForm.fecha_nacimiento}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                                placeholder="DD/MM/YYYY"
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Sexo</Text>
                            <View className="flex-row gap-2 mt-1">
                                <TouchableOpacity
                                    onPress={() => updateField('sexo', 'M')}
                                    className={`flex-1 py-3 rounded-lg border items-center ${editForm.sexo === 'M' ? 'bg-teal-50 border-teal-600' : 'bg-white border-gray-300'}`}
                                >
                                    <Text className={editForm.sexo === 'M' ? 'text-teal-700 font-bold' : 'text-gray-600'}>Masculino</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => updateField('sexo', 'F')}
                                    className={`flex-1 py-3 rounded-lg border items-center ${editForm.sexo === 'F' ? 'bg-teal-50 border-teal-600' : 'bg-white border-gray-300'}`}
                                >
                                    <Text className={editForm.sexo === 'F' ? 'text-teal-700 font-bold' : 'text-gray-600'}>Femenino</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CONTACTO */}
                <View className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="contact-phone" size={22} color="#008080" />
                        <Text className="text-gray-900 font-bold ml-2 text-lg">Contacto y Residencia</Text>
                    </View>
                    <View className="space-y-4">
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Teléfono</Text>
                            <TextInput
                                value={editForm.telefono}
                                onChangeText={(t) => {
                                    let num = t.replace(/\D/g, '');
                                    if (num.length === 1 && (num === '4' || num === '2')) num = '0' + num;
                                    updateField('telefono', num);
                                }}
                                keyboardType="numeric"
                                maxLength={11}
                                placeholder={editForm.telefono || "04141234567"} // Aquí mantenemos la data vieja como placeholder
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Comunidad</Text>
                            <TextInput
                                value={editForm.direccion_comunidad}
                                onChangeText={(t) => updateField('direccion_comunidad', t)}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Calle / Avenida</Text>
                            <TextInput
                                value={editForm.direccion_calle}
                                onChangeText={(t) => updateField('direccion_calle', t)}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-xs mb-1">Casa / Apartamento</Text>
                            <TextInput
                                value={editForm.direccion_casa}
                                onChangeText={(t) => updateField('direccion_casa', t)}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                            />
                        </View>
                    </View>
                </View>

                {/* ETNIA */}
                <View className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="public" size={22} color="#008080" />
                        <Text className="text-gray-900 font-bold ml-2 text-lg">Etnia</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500 text-xs mb-1">Nombre de la Etnia (Opcional)</Text>
                        <TextInput
                            value={editForm.etnia}
                            onChangeText={(t) => updateField('etnia', t)}
                            placeholder="Ej. Wayuu, Pemon..."
                            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                        />
                    </View>
                </View>

                {/* GRUPOS ESPECIALES */}
                <View className="bg-white rounded-xl border border-gray-200 p-4 mb-10 shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons name="group" size={22} color="#008080" />
                        <Text className="text-gray-900 font-bold ml-2 text-lg">Grupos Especiales</Text>
                    </View>
                    <Text className="text-gray-500 text-sm mb-4">Puede seleccionar más de una opción si aplica.</Text>

                    <View className="flex-row flex-wrap justify-between gap-y-3">
                        {GRUPOS_ESPECIALES.map((grupo) => {
                            const isSelected = editForm.grupos_especiales?.includes(grupo.value);
                            return (
                                <TouchableOpacity
                                    key={grupo.id}
                                    onPress={() => toggleGrupoEspecial(grupo.value)}
                                    activeOpacity={0.7}
                                    className={`w-[48%] h-14 px-2 flex-row items-center justify-center rounded-xl border ${isSelected ? 'border-teal-600 bg-teal-50' : 'border-gray-300 bg-white'}`}
                                >
                                    <MaterialIcons
                                        name={isSelected ? "check-box" : "check-box-outline-blank"}
                                        size={20}
                                        color={isSelected ? "#0d9488" : "#9CA3AF"}
                                        className="mr-2"
                                    />
                                    <Text className={`flex-1 text-sm font-medium leading-tight ${isSelected ? "text-teal-800" : 'text-gray-700'}`}>
                                        {grupo.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Modales */}
            <ModalConfirmacionEdicion
                visible={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    setShowConfirmModal(false);
                    router.back();
                }}
            />
            <ModalExitoEdicion
                visible={showSuccessModal}
                onConfirm={() => {
                    setShowSuccessModal(false);
                    router.back(); // Regresamos al perfil, el cual volverá a hacer fetch con los datos nuevos
                }}
            />
        </SafeAreaView>
    );
}