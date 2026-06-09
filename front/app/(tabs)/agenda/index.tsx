import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendario } from '../../../components/Calendario';
import { useAgendaPorFecha } from '../../../hooks/useAgendaPorFecha';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const estadoTema: Record<string, { bgSide: string; bgStatus: string; textStatus: string; icono: string }> = {
    Atrasada: {
        bgSide: 'bg-error-container',
        bgStatus: 'bg-error-container',
        textStatus: 'text-error',
        icono: 'warning',
    },
    'Para Hoy': {
        bgSide: 'bg-primary-container',
        bgStatus: 'bg-surface-container',
        textStatus: 'text-primary',
        icono: 'vaccines',
    },
    Futura: {
        bgSide: 'bg-tertiary-container',
        bgStatus: 'bg-tertiary-fixed',
        textStatus: 'text-tertiary',
        icono: 'event',
    },
};

export default function AgendaScreen() {
    const [vistaActual, setVistaActual] = useState<'dia' | 'semana' | 'mes'>('semana');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const strDate = dayjs(fechaSeleccionada).format('YYYY-MM-DD');

    const { items, loading } = useAgendaPorFecha(strDate);

    return (
        <SafeAreaView className="flex-1 bg-background">

            <View className="flex-1 px-5 pt-4 max-w-2xl mx-auto w-full">
                <FlatList
                    data={items}
                    keyExtractor={(item) => `${item.paciente_id}-${item.vacuna}-${item.dosis}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName="pb-24 gap-3"

                    ListHeaderComponent={() => (
                        <View className="mb-2">
                            <Calendario
                                vistaActual={vistaActual}
                                setVistaActual={setVistaActual}
                                fechaSeleccionada={fechaSeleccionada}
                                setFechaSeleccionada={setFechaSeleccionada}
                            />

                            <View className="flex-row items-center justify-between mt-4 mb-2 border-b border-outline-variant pb-2">
                                <Text className="font-headline-sm text-lg font-semibold text-primary capitalize">
                                    {dayjs(fechaSeleccionada).format('dddd D [de] MMMM')}
                                </Text>
                                <View className="bg-surface-container px-2 py-1 rounded-md">
                                    <Text className="font-label-md text-xs font-medium text-primary">
                                        {loading ? '...' : `${items.length} programadas`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    ListEmptyComponent={() =>
                        !loading ? (
                            <View className="py-8 items-center justify-center border border-dashed border-outline-variant rounded-xl mt-4">
                                <MaterialIcons name="event-available" size={48} color="#bdc9c8" />
                                <Text className="font-body-md text-on-surface-variant mt-2">No hay citas programadas para este día.</Text>
                            </View>
                        ) : (
                            <View className="py-8 items-center justify-center mt-4">
                                <ActivityIndicator size="large" color="#3e4949" />
                            </View>
                        )
                    }

                    renderItem={({ item }) => {
                        const tema = estadoTema[item.estado] || estadoTema.Futura;
                        const iniciales = `${item.paciente_nombre?.[0] || ''}${item.paciente_apellido?.[0] || ''}`.toUpperCase();
                        
                        return (
                            <TouchableOpacity className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 relative overflow-hidden mb-3 flex flex-col active:opacity-70">
                                <View className={`absolute left-0 top-0 bottom-0 w-1 ${tema.bgSide}`} />
                                
                                <View className="flex flex-row items-center justify-between w-full">
                                    <View className="flex flex-row items-center gap-3 flex-1">
                                        <View className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                                            <Text className="text-on-secondary-fixed font-label-lg text-label-lg">{iniciales}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-label-lg text-label-lg text-on-surface font-bold text-base" numberOfLines={1}>
                                                {item.paciente_nombre} {item.paciente_apellido}
                                            </Text>
                                            <Text className="font-body-md text-body-md text-on-surface-variant text-sm">{item.cedula}</Text>
                                        </View>
                                    </View>

                                    <View className="items-end ml-2 max-w-[160px]">
                                        <View className={`flex flex-row items-center gap-1 px-2 py-1 rounded-lg ${tema.bgStatus}`}>
                                            <MaterialIcons name={tema.icono as any} size={18} color={tema.textStatus === 'text-error' ? '#DC2626' : tema.textStatus === 'text-primary' ? '#005b52' : '#3e4949'} />
                                            <Text className={`font-body-medium text-body-medium font-medium text-sm ${tema.textStatus}`} numberOfLines={1}>
                                                {item.vacuna} {item.dosis}
                                            </Text>
                                        </View>
                                        <Text className={`font-label-md text-[10px] tracking-wider uppercase font-semibold mt-1 ${tema.textStatus}`}>
                                            {item.estado}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
