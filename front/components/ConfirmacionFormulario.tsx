// front/components/ConfirmacionFormulario.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export type SubmitState = 'idle' | 'loading' | 'success' | 'offline' | 'error';

interface ConfirmacionFormularioProps {
    visible: boolean;
    estado: SubmitState;
    mensajeError?: string;
    onClose: () => void;
    onSuccessAccept: () => void; // Para limpiar Zustand y navegar al inicio
}

export default function ConfirmacionFormulario({ visible, estado, mensajeError, onClose, onSuccessAccept }: ConfirmacionFormularioProps) {

    // Contenido dinámico según el estado
    const renderContent = () => {
        switch (estado) {
            case 'loading':
                return (
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#008080" />
                        <Text className="font-headline-sm text-on-surface mt-4 text-center">Guardando paciente...</Text>
                        <Text className="font-body-md text-on-surface-variant text-center mt-2">Por favor, espere un momento.</Text>
                    </View>
                );
            case 'success':
                return (
                    <View className="items-center">
                        <View className="w-16 h-16 bg-primary-container rounded-full items-center justify-center mb-4">
                            <MaterialIcons name="check" size={36} color="#008080" />
                        </View>
                        <Text className="font-headline-sm text-on-surface text-center">¡Creado con éxito!</Text>
                        <Text className="font-body-md text-on-surface-variant text-center mt-2">El paciente ha sido registrado en la base de datos.</Text>
                        <TouchableOpacity onPress={onSuccessAccept} className="mt-6 w-full h-12 bg-primary rounded-lg items-center justify-center">
                            <Text className="text-on-primary font-label-lg uppercase">Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'offline':
                return (
                    <View className="items-center">
                        <View className="w-16 h-16 bg-secondary-container rounded-full items-center justify-center mb-4">
                            <MaterialIcons name="cloud-off" size={36} color="#115E59" />
                        </View>
                        <Text className="font-headline-sm text-on-surface text-center">Guardado en el teléfono</Text>
                        <Text className="font-body-md text-on-surface-variant text-center mt-2">No hay conexión. El registro se sincronizará automáticamente cuando vuelva el internet.</Text>
                        <TouchableOpacity onPress={onSuccessAccept} className="mt-6 w-full h-12 bg-secondary rounded-lg items-center justify-center">
                            <Text className="text-on-secondary font-label-lg uppercase">Entendido</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'error':
                return (
                    <View className="items-center">
                        <View className="w-16 h-16 bg-error-container rounded-full items-center justify-center mb-4">
                            <MaterialIcons name="error-outline" size={36} color="#B3261E" />
                        </View>
                        <Text className="font-headline-sm text-error text-center">Ocurrió un error</Text>
                        <Text className="font-body-md text-on-surface-variant text-center mt-2">
                            {mensajeError || "No se pudo guardar el registro. Intente de nuevo."}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="mt-6 w-full h-12 border border-error rounded-lg items-center justify-center">
                            <Text className="text-error font-label-lg uppercase">Volver al formulario</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className="bg-surface w-full max-w-sm rounded-2xl p-6 shadow-xl">
                    {renderContent()}
                </View>
            </View>
        </Modal>
    );
}