import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useRegistroStore } from '../store/registroStore';
import { TopBar } from './TopBar';

export function TopBarRegistro() {
    const router = useRouter();
    const pathname = usePathname();
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Los hooks y funciones de Zustand deben estar DENTRO del componente
    const clearFormData = useRegistroStore((state) => state.clearFormData);

    // Saber si estamos en el primer paso
    const isPaso1 = pathname.includes('paso1');

    // Función para la flecha de retroceso
    const handleBackPress = () => {
        if (isPaso1) {
            setIsModalVisible(true); // Si es paso 1, intenta salir y avisa
        } else {
            router.back(); // Si es paso 2 o 3, retrocede normal sin borrar datos
        }
    };

    // Función para cancelar todo el registro
    const handleCancelPress = () => {
        setIsModalVisible(true);
    };

    // Función que se ejecuta al confirmar en el Modal
    const confirmExit = () => {
        setIsModalVisible(false);
        clearFormData(); // Limpia la memoria de Zustand
        router.replace('/'); // Redirige al menú principal
    };

    return (
        <>
            <TopBar
                title="Registro de Vacunación"
                leftSlot={
                    <TouchableOpacity onPress={handleBackPress} className="w-10 h-10 items-center justify-center -ml-2">
                        <MaterialIcons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                }
                rightSlot={
                    <TouchableOpacity onPress={handleCancelPress} className="w-10 h-10 items-center justify-center -mr-2">
                        <MaterialIcons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                }
            />

            {/* Modal Personalizado de Confirmación */}
            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-4">
                    <View className="bg-surface-container-lowest w-full rounded-3xl p-6 shadow-xl">

                        {/* Icono de advertencia */}
                        <View className="items-center mb-4">
                            <MaterialIcons name="warning-amber" size={48} color="#D97706" />
                        </View>

                        {/* Textos */}
                        <Text className="font-headline-sm text-on-surface text-center mb-2 font-bold">
                            ¿Cancelar registro?
                        </Text>
                        <Text className="text-on-surface-variant text-center mb-6 text-body-lg">
                            Si sales ahora, se perderán todos los datos que has ingresado.
                        </Text>

                        {/* Botones del Modal */}
                        <View className="flex flex-row justify-between gap-4">
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                className="flex-1 py-3 rounded-lg border border-primary items-center"
                            >
                                <Text className="text-primary font-label-lg font-bold">Continuar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={confirmExit}
                                className="flex-1 py-3 rounded-lg bg-error items-center justify-center"
                            >
                                <Text className=" font-label-lg font-bold text-white">Sí, Salir</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
        </>
    );
}