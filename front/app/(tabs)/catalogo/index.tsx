import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../../hooks/useApi';

export default function CatalogoScreen() {
    const router = useRouter();
    const [biologicos, setBiologicos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBiologicos = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/biologicos');
            setBiologicos(data);
        } catch (error) {
            console.error('Error fetching biologicos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBiologicos();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-3">
            <Text className="font-headline-sm text-lg text-on-surface font-bold mb-1">{item.nombre}</Text>
            {item.descripcion && (
                <Text className="font-body-md text-on-surface-variant mb-3">{item.descripcion}</Text>
            )}
            
            <View className="flex flex-row flex-wrap gap-2">
                {item.dosis?.map((d: any, index: number) => (
                    <View key={index} className="bg-secondary-fixed/30 px-3 py-1.5 rounded-lg border border-secondary-fixed/50">
                        <Text className="font-label-md text-primary font-semibold">{d.nombre_dosis}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-5 pt-8 pb-4 flex-row justify-between items-center bg-surface-container-low border-b border-outline-variant/30">
                <Text className="font-headline-md text-2xl text-on-surface font-bold">Catálogo de Vacunas</Text>
                <TouchableOpacity onPress={fetchBiologicos}>
                    <MaterialIcons name="refresh" size={24} color="#3e4949" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#005b52" />
                </View>
            ) : (
                <FlatList
                    data={biologicos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Text className="text-center text-on-surface-variant mt-10 font-body-lg">No hay vacunas registradas.</Text>
                    }
                />
            )}

            <TouchableOpacity
                onPress={() => router.push('/catalogo/agregar')}
                className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg elevation-5"
            >
                <MaterialIcons name="add" size={30} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
