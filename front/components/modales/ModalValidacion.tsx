import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ModalValidacionProps {
    visible: boolean;
    onClose: () => void;
    mensaje?: string;
}

export default function ModalValidacion({ visible, onClose, mensaje = "Debes llenar todos los campos obligatorios (*) para seguir" }: ModalValidacionProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 justify-center items-center px-5 z-[1000]">
                <View className="bg-surface rounded-2xl p-6 items-center w-full max-w-sm">
                    <MaterialIcons name="error-outline" size={48} color="#ba1a1a" className="mb-4" />
                    <Text className="text-xl font-bold text-on-surface mb-2 text-center">Campos Incompletos</Text>
                    <Text className="text-on-surface-variant text-center mb-6">{mensaje}</Text>
                    
                    <TouchableOpacity onPress={onClose} className="w-full py-3 rounded-lg items-center bg-primary">
                        <Text className="text-white font-semibold">Entendido</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
