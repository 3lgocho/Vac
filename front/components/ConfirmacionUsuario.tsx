import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    titulo: string;
    mensaje: string;
    onAceptar: () => void;
}

export default function ConfirmacionUsuario({ visible, titulo, mensaje, onAceptar }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50 px-5">
                <View className="bg-white w-full max-w-sm rounded-2xl p-6 items-center shadow-xl">
                    <View className="bg-teal-100 p-3 rounded-full mb-4">
                        <MaterialIcons name="check-circle" size={48} color="#008080" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 mb-2 text-center">{titulo}</Text>
                    <Text className="text-gray-500 text-center mb-6">{mensaje}</Text>

                    <TouchableOpacity
                        onPress={onAceptar}
                        className="w-full py-3 rounded-lg items-center bg-teal-700"
                    >
                        <Text className="text-white font-semibold text-base">Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
