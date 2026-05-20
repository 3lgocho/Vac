// front/components/registro/modales/BiologicosModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Biologico } from '../../../hooks/useBiologicos';

interface BiologicosModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (biologico: Biologico) => void;
    biologicos: Biologico[];
    titulo: string;
    tituloClassName?: string;
}

export default function BiologicosModal({
    visible, onClose, onSelect, biologicos, titulo, tituloClassName = "text-on-surface"
}: BiologicosModalProps) {
    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-center items-center p-4"
                activeOpacity={1}
                onPress={onClose}
            >
                <View className="bg-surface w-full max-h-[70%] rounded-xl overflow-hidden p-4">
                    <Text className={`font-headline-sm mb-4 ${tituloClassName}`}>{titulo}</Text>
                    <FlatList
                        data={biologicos}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="p-4 border-b border-surface-container-highest"
                                onPress={() => onSelect(item)}
                            >
                                <Text className="font-body-lg text-on-surface">{item.nombre}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
}