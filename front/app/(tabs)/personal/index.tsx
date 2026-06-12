import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePersonal, PersonalSalud } from '../../../hooks/usePersonal';
import ConfirmacionUsuario from '../../../components/ConfirmacionUsuario';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export default function PersonalScreen() {
    const { personal, loading, error, loadPersonal, crearPersonal, actualizarPersonal, cambiarPin, eliminarPersonal } = usePersonal();

    const [modalVisible, setModalVisible] = useState(false);
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [actionMenuVisible, setActionMenuVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<PersonalSalud | null>(null);

    // Formularios
    const [formData, setFormData] = useState({ cedula: '', nombre_completo: '', rol: 'enfermero', pin: '' });
    const [newPin, setNewPin] = useState('');
    const [confirmacionVisible, setConfirmacionVisible] = useState(false);
    const [confirmacionTitulo, setConfirmacionTitulo] = useState('');
    const [confirmacionMensaje, setConfirmacionMensaje] = useState('');
    const onConfirmacionAceptar = useRef<() => void>(() => { });

    const openCreateModal = () => {
        setSelectedUser(null);
        setFormData({ cedula: '', nombre_completo: '', rol: 'enfermero', pin: '' });
        setModalVisible(true);
    };

    const openEditModal = (user: PersonalSalud) => {
        setSelectedUser(user);
        setFormData({ cedula: user.cedula, nombre_completo: user.nombre_completo, rol: user.rol || 'enfermero', pin: '' });
        setActionMenuVisible(false);
        setModalVisible(true);
    };

    const openPinModal = (user: PersonalSalud) => {
        setSelectedUser(user);
        setNewPin('');
        setActionMenuVisible(false);
        setPinModalVisible(true);
    };

    const mostrarConfirmacion = (titulo: string, mensaje: string, onAceptar: () => void) => {
        setConfirmacionTitulo(titulo);
        setConfirmacionMensaje(mensaje);
        onConfirmacionAceptar.current = onAceptar;
        setConfirmacionVisible(true);
    };

    const handleSave = async () => {
        if (!formData.cedula || !formData.nombre_completo) {
            Alert.alert('Error', 'Cédula y nombre son obligatorios');
            return;
        }
        try {
            if (selectedUser) {
                await actualizarPersonal(selectedUser.id, {
                    cedula: formData.cedula,
                    nombre_completo: formData.nombre_completo,
                    rol: formData.rol,
                });
                mostrarConfirmacion(
                    'Usuario actualizado',
                    `Los datos de ${formData.nombre_completo} han sido actualizados correctamente.`,
                    () => {
                        setConfirmacionVisible(false);
                        setModalVisible(false);
                    }
                );
            } else {
                if (!formData.pin) {
                    Alert.alert('Error', 'El PIN es obligatorio para crear un usuario');
                    return;
                }
                await crearPersonal(formData);
                mostrarConfirmacion(
                    'Usuario creado',
                    `${formData.nombre_completo} ha sido registrado como personal de salud.`,
                    () => {
                        setConfirmacionVisible(false);
                        setModalVisible(false);
                    }
                );
            }
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const handleSavePin = async () => {
        if (!newPin || newPin.length < 4) {
            Alert.alert('Error', 'El PIN debe tener al menos 4 caracteres');
            return;
        }
        if (selectedUser) {
            try {
                await cambiarPin(selectedUser.id, newPin);
                mostrarConfirmacion(
                    'PIN actualizado',
                    `El PIN de ${selectedUser.nombre_completo} ha sido cambiado correctamente.`,
                    () => {
                        setConfirmacionVisible(false);
                        setPinModalVisible(false);
                    }
                );
            } catch (err: any) {
                Alert.alert('Error', err.message);
            }
        }
    };

    const handleDelete = (user: PersonalSalud) => {
        setActionMenuVisible(false);
        Alert.alert(
            'Eliminar Usuario',
            `¿Estás seguro que deseas eliminar a ${user.nombre_completo}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await eliminarPersonal(user.id);
                            mostrarConfirmacion(
                                'Usuario eliminado',
                                `${user.nombre_completo} ha sido eliminado del sistema.`,
                                () => setConfirmacionVisible(false)
                            );
                        } catch (err: any) {
                            Alert.alert('Error', err.message);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: PersonalSalud }) => {

        const iniciales = item.nombre_completo
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'P';

        return (
            <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-3 relative overflow-hidden flex-row items-center justify-between">
                <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></View>
                <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                        <Text className="text-on-secondary-fixed font-bold text-base">{iniciales}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-on-surface" numberOfLines={1}>
                            {item.nombre_completo}
                        </Text>
                        <Text className="text-sm text-on-surface-variant font-medium">
                            C.I: {item.cedula}
                        </Text>
                    </View>
                </View>

                <View className="items-end mr-3">
                    <View className={`flex-row items-center gap-1 px-2 py-1 rounded-lg ${item.rol === 'coordinador' ? 'bg-primary-container' : 'bg-secondary-fixed/60'}`}>
                        <MaterialIcons
                            name={item.rol === 'coordinador' ? "admin-panel-settings" : "health-and-safety"}
                            size={16}
                            className={item.rol === 'coordinador' ? 'text-on-primary-container' : 'text-primary'}
                        />
                        <Text className={`font-body-small text-body-medium uppercase ${item.rol === 'coordinador' ? 'text-on-primary-container' : 'text-primary'}`} numberOfLines={1}>
                            {item.rol}
                        </Text>
                    </View>
                    <Text className="text-xs text-outline mt-1">
                        {dayjs(item.creado_en).format('DD/MM/YYYY')}
                    </Text>
                </View>

                <TouchableOpacity
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-surface-container"
                    onPress={() => {
                        setSelectedUser(item);
                        setActionMenuVisible(true);
                    }}
                >
                    <MaterialIcons name="more-vert" size={24} color="#3e4949" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background relative">
                <View className="flex-row items-center justify-between px-5 h-16 border-b border-outline-variant bg-background">
                <Text className="text-primary font-bold text-xl tracking-tight">Gestión de Personal</Text>
                <TouchableOpacity onPress={openCreateModal} className="w-10 h-10 bg-primary rounded-full items-center justify-center">
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {error && (
                <View className="m-5 p-3 bg-error-container rounded-lg">
                    <Text className="text-error">{error}</Text>
                </View>
            )}

            <FlatList
                data={personal}
                keyExtractor={item => item.id.toString()}
                contentContainerClassName="p-5 pb-24"
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View className="py-10 items-center justify-center">
                        {loading ? <ActivityIndicator size="large" color="#008080" /> : <Text className="text-on-surface-variant">No hay personal registrado.</Text>}
                    </View>
                )}
            />

            {/* Action Menu Modal */}
            <Modal visible={actionMenuVisible} transparent animationType="fade" onRequestClose={() => setActionMenuVisible(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setActionMenuVisible(false)} className="flex-1 bg-black/50 justify-end">
                    <View className="bg-surface rounded-t-3xl p-5 pb-10">
                        <Text className="text-center font-bold text-lg mb-4">{selectedUser?.nombre_completo}</Text>

                        <TouchableOpacity onPress={() => openEditModal(selectedUser!)} className="flex-row items-center p-4 border-b border-outline-variant">
                            <MaterialIcons name="edit" size={24} color="#3e4949" />
                            <Text className="text-base ml-4 font-medium text-on-surface">Editar Datos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => openPinModal(selectedUser!)} className="flex-row items-center p-4 border-b border-outline-variant">
                            <MaterialIcons name="password" size={24} color="#3e4949" />
                            <Text className="text-base ml-4 font-medium text-on-surface">Cambiar PIN</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDelete(selectedUser!)} className="flex-row items-center p-4">
                            <MaterialIcons name="delete" size={24} color="#ba1a1a" />
                            <Text className="text-base ml-4 font-medium text-error">Eliminar Personal</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Create/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-surface p-5 pt-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-primary">{selectedUser ? 'Editar Personal' : 'Nuevo Personal'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <MaterialIcons name="close" size={28} color="#3e4949" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-on-surface-variant font-medium mb-1">Cédula</Text>
                    <TextInput
                        className="bg-surface-container border border-outline-variant rounded-lg p-4 mb-4 text-on-surface text-base"
                        placeholder="Ej: 12345678"
                        keyboardType="numeric"
                        value={formData.cedula}
                        onChangeText={t => setFormData({ ...formData, cedula: t })}
                    />

                    <Text className="text-on-surface-variant font-medium mb-1">Nombre Completo</Text>
                    <TextInput
                        className="bg-surface-container border border-outline-variant rounded-lg p-4 mb-4 text-on-surface text-base"
                        placeholder="Ej: Juan Pérez"
                        value={formData.nombre_completo}
                        onChangeText={t => setFormData({ ...formData, nombre_completo: t })}
                    />

                    <Text className="text-on-surface-variant font-medium mb-1">Rol</Text>
                    <View className="flex-row mb-4 bg-surface-container rounded-lg p-1">
                        <TouchableOpacity
                            onPress={() => setFormData({ ...formData, rol: 'enfermero' })}
                            className={`flex-1 p-3 rounded-md items-center ${formData.rol === 'enfermero' ? 'bg-primary' : ''}`}
                            style={formData.rol === 'enfermero' ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 } : {}}
                        >
                            <Text className={`font-semibold ${formData.rol === 'enfermero' ? 'text-white' : 'text-on-surface-variant'}`}>Enfermero</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFormData({ ...formData, rol: 'coordinador' })}
                            className={`flex-1 p-3 rounded-md items-center ${formData.rol === 'coordinador' ? 'bg-primary' : ''}`}
                            style={formData.rol === 'coordinador' ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 } : {}}
                        >
                            <Text className={`font-semibold ${formData.rol === 'coordinador' ? 'text-white' : 'text-on-surface-variant'}`}>Coordinador</Text>
                        </TouchableOpacity>
                    </View>

                    {!selectedUser && (
                        <>
                            <Text className="text-on-surface-variant font-medium mb-1">PIN de Acceso</Text>
                            <TextInput
                                className="bg-surface-container border border-outline-variant rounded-lg p-4 mb-8 text-on-surface text-base"
                                placeholder="Minimo 4 dígitos"
                                keyboardType="numeric"
                                secureTextEntry
                                value={formData.pin}
                                onChangeText={t => setFormData({ ...formData, pin: t })}
                            />
                        </>
                    )}

                    <TouchableOpacity onPress={handleSave} className="bg-primary p-4 rounded-xl items-center mt-4">
                        <Text className="text-white font-bold text-lg">{selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            {/* Change PIN Modal */}
            <Modal visible={pinModalVisible} transparent animationType="fade" onRequestClose={() => setPinModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-black/50 justify-center p-5">
                    <View className="bg-surface rounded-2xl p-6">
                        <Text className="text-xl font-bold text-on-surface mb-2">Cambiar PIN</Text>
                        <Text className="text-on-surface-variant mb-4">Ingresa el nuevo PIN para {selectedUser?.nombre_completo}</Text>

                        <TextInput
                            className="bg-surface-container border border-outline-variant rounded-lg p-4 mb-6 text-on-surface text-center text-2xl tracking-widest"
                            placeholder="****"
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={8}
                            value={newPin}
                            onChangeText={setNewPin}
                            autoFocus
                        />

                        <View className="flex-row justify-end gap-3">
                            <TouchableOpacity onPress={() => setPinModalVisible(false)} className="px-5 py-3 rounded-lg">
                                <Text className="text-primary font-semibold">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSavePin} className="bg-primary px-5 py-3 rounded-lg">
                                <Text className="text-white font-semibold">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Confirmación de éxito */}
            <ConfirmacionUsuario
                visible={confirmacionVisible}
                titulo={confirmacionTitulo}
                mensaje={confirmacionMensaje}
                onAceptar={() => onConfirmacionAceptar.current()}
            />
        </SafeAreaView>
    );
}
