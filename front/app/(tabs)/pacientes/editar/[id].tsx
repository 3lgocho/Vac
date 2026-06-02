import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator,  TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TopBar } from '../../../../components/TopBar';
import { apiFetch } from '../../../../hooks/useApi';

import ModalConfirmacionEdicion from '../../../../components/registro/modales/ModalConfirmacionEdicion';
import ModalExitoEdicion from '../../../../components/registro/modales/ModalExitoEdicion';
import BiologicosModal from '../../../../components/registro/modales/BiologicosModal';
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

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [editForm, setEditForm] = useState<any>({
        nombre: '', apellido: '', cedula: '', genero: 'Femenino',
        fecha_nacimiento: '', telefono: '', direccion_comunidad: '',
        direccion_calle: '', direccion_casa: '', etnia: '', grupos_especiales: [],
    });

    const [alergias, setAlergias] = useState<{ biologico_id: number; nombre: string }[]>([]);
    const [biologicos, setBiologicos] = useState<any[]>([]);
    const [showAlergiaModal, setShowAlergiaModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [perfilRes, bioRes] = await Promise.all([
                    apiFetch(`/pacientes/${id}`),
                    apiFetch('/biologicos'),
                ]);

                if (perfilRes.ok) {
                    const data = await perfilRes.json();
                    const p = data.paciente;

                    let gruposFormateados: string[] = [];
                    if (p.grupos_especiales) {
                        gruposFormateados = typeof p.grupos_especiales === 'string'
                            ? JSON.parse(p.grupos_especiales)
                            : p.grupos_especiales;
                    }

                    setEditForm({
                        nombre: p.nombre || '',
                        apellido: p.apellido || '',
                        cedula: p.cedula || '',
                        genero: p.genero || 'Femenino',
                        fecha_nacimiento: parseDateToFrontend(p.fecha_nacimiento),
                        telefono: p.telefono || '',
                        direccion_comunidad: p.direccion_comunidad || '',
                        direccion_calle: p.direccion_calle || '',
                        direccion_casa: p.direccion_casa || '',
                        etnia: p.etnia || '',
                        grupos_especiales: gruposFormateados,
                    });

                    setAlergias(
                        (data.alergias || []).map((a: any) => ({
                            biologico_id: a.biologico_id || a.id,
                            nombre: a.biologico_nombre,
                        }))
                    );
                }

                if (bioRes.ok) {
                    setBiologicos(await bioRes.json());
                }
            } catch (error) {
                Alert.alert('Error', 'No se pudo cargar el paciente.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const updateField = (field: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [field]: value }));
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
        const current = editForm.grupos_especiales || [];
        const newGroups = current.includes(grupoValue)
            ? current.filter((g: string) => g !== grupoValue)
            : [...current, grupoValue];
        updateField('grupos_especiales', newGroups);
    };

    const addAlergia = (item: { id: number; nombre: string }) => {
        setAlergias((prev) => {
            const existe = prev.some((a) => a.biologico_id === item.id);
            if (existe) return prev;
            setIsDirty(true);
            return [...prev, { biologico_id: item.id, nombre: item.nombre }];
        });
        setShowAlergiaModal(false);
    };

    const removeAlergia = (biologico_id: number) => {
        setAlergias((prev) => prev.filter((a) => a.biologico_id !== biologico_id));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...editForm,
                fecha_nacimiento: parseDateToBackend(editForm.fecha_nacimiento),
                correo: null,
                grupos_especiales: editForm.grupos_especiales.length > 0 ? editForm.grupos_especiales : null,
                alergias: alergias.map((a) => a.biologico_id),
            };

            const res = await apiFetch(`/pacientes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsDirty(false);
                setShowOverwriteModal(false);
                setShowSuccessModal(true);
            } else {
                const body = await res.text();
                Alert.alert("Error", body || "No se pudo actualizar el paciente.");
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
                    <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <TopBar
                title="Editar Paciente"
                leftSlot={
                    <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center -ml-2">
                        <MaterialIcons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                }
                rightSlot={
                    <TouchableOpacity
                        onPress={() => setShowOverwriteModal(true)}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#008080" />
                        ) : (
                            <Text className="font-label-lg font-bold text-primary">Guardar</Text>
                        )}
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1 px-5 py-6 pb-12" showsVerticalScrollIndicator={false}>
                {/* IDENTIDAD */}
                <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4 mb-5">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="person" size={22} color="#008080" />
                        <Text className="font-label-lg text-label-lg text-on-surface ml-2">Identidad</Text>
                    </View>
                    <View className="gap-4">
                        <EditField label="Nombres" value={editForm.nombre} onChange={(t) => updateField('nombre', t)} />
                        <EditField label="Apellidos" value={editForm.apellido} onChange={(t) => updateField('apellido', t)} />
                        <EditField
                            label="Cédula"
                            value={editForm.cedula}
                            onChange={(t) => updateField('cedula', t.replace(/\D/g, ''))}
                            keyboardType="numeric"
                        />
                        <View>
                            <Text className="text-on-surface-variant font-body-xs mb-1">Fecha de Nacimiento</Text>
                            <TextInput
                                value={editForm.fecha_nacimiento}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                                placeholder="DD/MM/YYYY"
                                className="border border-outline-variant rounded-lg px-4 py-3 text-on-surface bg-surface-container-lowest font-body-md"
                            />
                        </View>
                        <View>
                            <Text className="text-on-surface-variant font-body-xs mb-1">Género</Text>
                            <View className="flex-row w-full border border-outline-variant/50 mt-1 bg-surface-container-low rounded-lg p-1">
                                <TouchableOpacity
                                    onPress={() => updateField('genero', 'Femenino')}
                                    className={`flex-1 items-center justify-center py-2 rounded-md ${editForm.genero === 'Femenino' ? 'bg-surface-container-lowest' : ''}`}
                                    style={editForm.genero === 'Femenino' ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 } : {}}
                                >
                                    <Text className={editForm.genero === 'Femenino' ? 'text-primary font-label-lg font-semibold text-md' : 'text-on-surface-variant font-label-lg font-semibold text-md'}>Femenino</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => updateField('genero', 'Masculino')}
                                    className={`flex-1 items-center justify-center py-2 rounded-md ${editForm.genero === 'Masculino' ? 'bg-surface-container-lowest' : ''}`}
                                    style={editForm.genero === 'Masculino' ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 } : {}}
                                >
                                    <Text className={editForm.genero === 'Masculino' ? 'text-primary font-label-lg font-semibold text-md' : 'text-on-surface-variant font-label-lg font-semibold text-md'}>Masculino</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CONTACTO Y RESIDENCIA */}
                <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4 mb-5">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="location-on" size={22} color="#008080" />
                        <Text className="font-label-lg text-label-lg text-on-surface ml-2">Contacto y Residencia</Text>
                    </View>
                    <View className="gap-4">
                        <EditField
                            label="Teléfono"
                            value={editForm.telefono}
                            onChange={(t) => {
                                let num = t.replace(/\D/g, '');
                                if (num.length === 1 && (num === '4' || num === '2')) num = '0' + num;
                                updateField('telefono', num);
                            }}
                            keyboardType="numeric"
                            maxLength={11}
                        />
                        <EditField label="Comunidad" value={editForm.direccion_comunidad} onChange={(t) => updateField('direccion_comunidad', t)} />
                        <EditField label="Calle / Avenida" value={editForm.direccion_calle} onChange={(t) => updateField('direccion_calle', t)} />
                        <EditField label="Casa / Apartamento" value={editForm.direccion_casa} onChange={(t) => updateField('direccion_casa', t)} />
                    </View>
                </View>

                {/* ETNIA */}
                <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4 mb-5">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="public" size={22} color="#008080" />
                        <Text className="font-label-lg text-label-lg text-on-surface ml-2">Etnia</Text>
                    </View>
                    <EditField
                        label="Nombre de la Etnia (Opcional)"
                        value={editForm.etnia}
                        onChange={(t) => updateField('etnia', t)}
                        placeholder="Ej. Wayuu, Pemon..."
                    />
                </View>

                {/* GRUPOS ESPECIALES */}
                <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4 mb-5">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons name="group" size={22} color="#008080" />
                        <Text className="font-label-lg text-label-lg text-on-surface ml-2">Grupos Especiales</Text>
                    </View>
                    <Text className="text-on-surface-variant font-body-sm mb-4">Puede seleccionar más de una opción si aplica.</Text>
                    <View className="flex-row flex-wrap justify-between gap-y-3">
                        {GRUPOS_ESPECIALES.map((grupo) => {
                            const isSelected = editForm.grupos_especiales?.includes(grupo.value);
                            return (
                                <TouchableOpacity
                                    key={grupo.id}
                                    onPress={() => toggleGrupoEspecial(grupo.value)}
                                    activeOpacity={0.7}
                                    className={`w-[48%] h-14 px-2 flex-row items-center justify-center rounded-xl border ${isSelected ? 'border-primary bg-primary-container' : 'border-outline-variant'}`}
                                >
                                    <MaterialIcons
                                        name={isSelected ? "check-box" : "check-box-outline-blank"}
                                        size={20}
                                        color={isSelected ? "#008080" : "#9CA3AF"}
                                    />
                                    <Text className={`flex-1 font-body-sm text-left ml-1 leading-tight ${isSelected ? "text-primary" : 'text-on-surface'}`}>
                                        {grupo.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ALERGIAS */}
                <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-4 mb-10">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons name="medical-information" size={22} color="#B3261E" />
                        <Text className="font-label-lg text-label-lg text-on-surface ml-2">Alergias</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setShowAlergiaModal(true)}
                        className="w-full min-h-[48px] border border-error rounded-lg px-4 flex-row items-center justify-between mb-4"
                    >
                        <Text className="text-on-surface font-body-md">Agregar alergia a biológico...</Text>
                        <MaterialIcons name="add" size={24} color="#B3261E" />
                    </TouchableOpacity>

                    {alergias.length === 0 ? (
                        <Text className="text-on-surface-variant font-body-md text-center py-4">No hay alergias registradas</Text>
                    ) : (
                        alergias.map((alergia) => (
                            <View key={alergia.biologico_id} className="flex-row items-center justify-between bg-error-container border border-error rounded-lg p-3 mb-2">
                                <Text className="text-on-error-container font-label-md flex-1">{alergia.nombre}</Text>
                                <TouchableOpacity onPress={() => removeAlergia(alergia.biologico_id)} className="w-10 h-10 items-center justify-center rounded-full bg-white/50">
                                    <MaterialIcons name="close" size={20} color="#B3261E" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
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

            <ModalSobrescribir
                visible={showOverwriteModal}
                onClose={() => setShowOverwriteModal(false)}
                onConfirm={handleSave}
            />

            <ModalExitoEdicion
                visible={showSuccessModal}
                onConfirm={() => {
                    setShowSuccessModal(false);
                    router.back();
                }}
            />

            <BiologicosModal
                visible={showAlergiaModal}
                onClose={() => setShowAlergiaModal(false)}
                biologicos={biologicos}
                titulo="Seleccione Biológico (Alergia)"
                tituloClassName="text-error"
                onSelect={addAlergia}
            />
        </SafeAreaView>
    );
}

function EditField({
    label, value, onChange, placeholder, keyboardType, maxLength
}: {
    label: string; value: string; onChange: (t: string) => void; placeholder?: string; keyboardType?: any; maxLength?: number;
}) {
    return (
        <View>
            <Text className="text-on-surface-variant font-body-xs mb-1">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                maxLength={maxLength}
                placeholder={placeholder}
                className="border border-outline-variant rounded-lg px-4 py-3 text-on-surface bg-surface-container-lowest font-body-md"
            />
        </View>
    );
}

function ModalSobrescribir({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: () => void }) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50 px-5">
                <View className="bg-surface w-full rounded-2xl p-6 items-center shadow-xl">
                    <MaterialIcons name="warning-amber" size={48} color="#f59e0b" />
                    <Text className="text-xl font-bold text-on-surface mb-2 text-center mt-4">¿Está seguro de sobreescribir estos datos?</Text>
                    <Text className="text-on-surface-variant text-center mb-6">
                        Se actualizarán los datos del paciente con la información ingresada. Esta acción no se puede deshacer.
                    </Text>
                    <View className="flex-row gap-4 w-full">
                        <TouchableOpacity onPress={onClose} className="flex-1 py-3 rounded-lg border border-outline-variant items-center">
                            <Text className="text-on-surface font-semibold">Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onConfirm} className="flex-1 py-3 rounded-lg items-center bg-primary">
                            <Text className="text-white font-semibold">Sobrescribir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
