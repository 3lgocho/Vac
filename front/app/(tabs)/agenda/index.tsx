import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendario } from '../../../components/Calendario';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

// 1. Tipado explícito para corregir el error de FlatList
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface TemaCita {
    bgSide: string;
    bgStatus: string;
    textStatus: string;
}

interface Cita {
    id: string;
    hora: string;
    estado: string;
    paciente: string;
    tipo: string;
    icono: IconName; // Esto acepta cualquier icono válido
    tema: TemaCita;
}

// 2. Asignar el tipo de retorno explícitamente a la función
const generarFakeCitas = (fechaString: string): Cita[] => {
    const diaNum = dayjs(fechaString).date();

    if (diaNum % 2 === 0) {
        return [
            { id: '1', hora: '09:00 AM', estado: 'Confirmada', paciente: 'Carlos Mendoza', tipo: 'Vacuna COVID-19', icono: 'vaccines', tema: { bgSide: 'bg-primary-container', bgStatus: 'bg-surface-container', textStatus: 'text-primary' } },
            { id: '2', hora: '10:30 AM', estado: 'Pendiente', paciente: 'Maria Gonzalez', tipo: 'Consulta Pediátrica', icono: 'child-care', tema: { bgSide: 'bg-secondary-container', bgStatus: 'bg-secondary-fixed', textStatus: 'text-secondary' } }
        ];
    } else {
        return [
            { id: '3', hora: '02:00 PM', estado: 'Reprogramada', paciente: 'Juan Perez', tipo: 'Evaluación General', icono: 'medical-services', tema: { bgSide: 'bg-tertiary-container', bgStatus: 'bg-tertiary-fixed', textStatus: 'text-tertiary' } }
        ];
    }
};
export default function AgendaScreen() {
    const [vistaActual, setVistaActual] = useState<'dia' | 'semana' | 'mes'>('semana');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

    // Obtenemos las citas del día exacto seleccionado
    const citasDelDia = useMemo(() => {
        const strDate = dayjs(fechaSeleccionada).format('YYYY-MM-DD');
        return generarFakeCitas(strDate);
    }, [fechaSeleccionada]);

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* TopAppBar */}
            <View className="bg-surface border-b border-outline-variant flex-row justify-between items-center px-5 h-14">
                <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-low">
                    <MaterialIcons name="menu" size={24} color="#3e4949" />
                </TouchableOpacity>
                <Text className="text-primary font-semibold text-base tracking-tight">Agenda de Vacunación</Text>
                <TouchableOpacity className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high">
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=32' }} className="w-full h-full" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-5 pt-4 max-w-2xl mx-auto w-full">
                {/* Lista de citas y Calendario */}
                <FlatList
                    data={citasDelDia}
                    keyExtractor={(item) => item.id}
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

                            {/* Cabecera del día seleccionado */}
                            <View className="flex-row items-center justify-between mt-4 mb-2 border-b border-outline-variant pb-2">
                                <Text className="font-headline-sm text-lg font-semibold text-primary capitalize">
                                    {dayjs(fechaSeleccionada).format('dddd D [de] MMMM')}
                                </Text>
                                <View className="bg-surface-container px-2 py-1 rounded-md">
                                    <Text className="font-label-md text-xs font-medium text-primary">
                                        {citasDelDia.length} programadas
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    // Si no hay citas ese día
                    ListEmptyComponent={() => (
                        <View className="py-8 items-center justify-center border border-dashed border-outline-variant rounded-xl mt-4">
                            <MaterialIcons name="event-available" size={48} color="#bdc9c8" />
                            <Text className="font-body-md text-on-surface-variant mt-2">No hay citas programadas para este día.</Text>
                        </View>
                    )}

                    renderItem={({ item }) => (
                        <TouchableOpacity className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 relative overflow-hidden shadow-sm active:opacity-70 mb-2">
                            <View className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.tema.bgSide}`} />
                            <View className="pl-2 gap-2">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-row items-center gap-1">
                                        <MaterialIcons name="schedule" size={16} color="#3e4949" />
                                        <Text className="text-on-surface-variant font-label-md text-xs font-medium">{item.hora}</Text>
                                    </View>
                                    <View className={`${item.tema.bgStatus} px-2 py-0.5 rounded`}>
                                        <Text className={`${item.tema.textStatus} font-label-md uppercase text-[10px] tracking-wider font-semibold`}>{item.estado}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text className="font-label-lg font-semibold text-on-surface mb-1 text-base">{item.paciente}</Text>
                                    <View className="flex-row items-center gap-2">
                                        <MaterialIcons name={item.icono} size={18} color="#3e4949" />
                                        <Text className="font-body-md text-sm text-on-surface-variant flex-1">{item.tipo}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}