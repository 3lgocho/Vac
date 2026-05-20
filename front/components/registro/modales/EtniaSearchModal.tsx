// front/components/registro/modales/EtniaSearchModal.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ETNIAS_INDIGENAS, EtniaItem } from '../../../constants/etnias';

interface EtniaSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (valor: string, etiqueta: string) => void;
}

export default function EtniaSearchModal({ visible, onClose, onSelect }: EtniaSearchModalProps) {
    const [searchIndigena, setSearchIndigena] = useState('');

    const handleSelect = (item: EtniaItem) => {
        onSelect(item.value, item.label);
        setSearchIndigena(''); // Limpiamos la búsqueda al seleccionar
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-surface-container-lowest h-[80%] rounded-t-3xl p-6 shadow-xl">
                    <View className="flex flex-row justify-between items-center mb-4">
                        <Text className="font-headline-sm text-on-surface">Buscar Etnia</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <MaterialIcons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex flex-row items-center border border-primary rounded-lg bg-surface-container-low px-3 mb-4">
                        <MaterialIcons name="search" size={20} color="#008080" />
                        <TextInput
                            autoFocus={true}
                            className="flex-1 h-12 px-2 text-on-surface"
                            placeholder="Ej. Wayuu..."
                            value={searchIndigena}
                            onChangeText={setSearchIndigena}
                        />
                        {searchIndigena.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchIndigena('')}>
                                <MaterialIcons name="cancel" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView keyboardShouldPersistTaps="handled" className="flex-1">
                        {ETNIAS_INDIGENAS
                            .filter(item =>
                                item.label.toLowerCase().includes(searchIndigena.toLowerCase()) ||
                                item.id.includes(searchIndigena)
                            )
                            .map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className="px-4 py-4 border-b border-surface-container-highest active:bg-surface-container"
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text className="text-on-surface font-body-lg">{item.label}</Text>
                                </TouchableOpacity>
                            ))}

                        {ETNIAS_INDIGENAS.filter(item =>
                            item.label.toLowerCase().includes(searchIndigena.toLowerCase())
                        ).length === 0 && (
                                <View className="px-4 py-8 items-center">
                                    <Text className="text-on-surface-variant italic text-sm">No se encontraron etnias coincidentes</Text>
                                </View>
                            )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}