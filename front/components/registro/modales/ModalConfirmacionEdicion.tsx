import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ModalConfirmacionEdicion({ visible, onClose, onConfirm }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/50 px-5">
                <View className="bg-white w-full rounded-2xl p-6 items-center shadow-xl">
                    <MaterialIcons name="warning-amber" size={48} color="#f59e0b" className="mb-4" />
                    <Text className="text-xl font-bold text-gray-900 mb-2 text-center">Cambios sin guardar</Text>
                    <Text className="text-gray-500 text-center mb-6">
                        Tienes cambios sin guardar. Si sales ahora, se perderá la información editada. ¿Estás seguro de que deseas salir?
                    </Text>

                    <View className="flex-row gap-4 w-full">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 py-3 rounded-lg border border-gray-300 items-center bg-white"
                        >
                            <Text className="text-gray-700 font-semibold">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            className="flex-1 py-3 rounded-lg items-center bg-red-600"
                        >
                            <Text className="text-white font-semibold">Salir sin guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}