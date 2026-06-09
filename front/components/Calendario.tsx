import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar idioma español

// Configurar dayjs globalmente en español
dayjs.locale('es');

type VistaType = 'dia' | 'semana' | 'mes';

interface CalendarioProps {
    vistaActual: VistaType;
    setVistaActual: (vista: VistaType) => void;
    fechaSeleccionada: Date;
    setFechaSeleccionada: (fecha: Date) => void;
}

const diasSemanaNombres = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function Calendario({ vistaActual, setVistaActual, fechaSeleccionada, setFechaSeleccionada }: CalendarioProps) {
    const diaActualObj = dayjs(fechaSeleccionada);
    const hoyStr = dayjs().format('YYYY-MM-DD');
    const seleccionadoStr = diaActualObj.format('YYYY-MM-DD');

    // Funciones para los botones de flechas (< y >)
    const navegar = (direccion: 'atras' | 'adelante') => {
        const cantidad = direccion === 'atras' ? -1 : 1;
        if (vistaActual === 'mes') {
            setFechaSeleccionada(diaActualObj.add(cantidad, 'month').toDate());
        } else if (vistaActual === 'semana') {
            setFechaSeleccionada(diaActualObj.add(cantidad, 'week').toDate());
        } else {
            setFechaSeleccionada(diaActualObj.add(cantidad, 'day').toDate());
        }
    };

    // --- CÁLCULO DE LA VISTA SEMANAL ---
    const diasSemana = useMemo(() => {
        // Encontrar el lunes de la semana de la fecha seleccionada
        const diaDeLaSemana = diaActualObj.day(); // 0 = Dom, 1 = Lun...
        const diferenciaLunes = diaDeLaSemana === 0 ? 6 : diaDeLaSemana - 1;
        const lunes = diaActualObj.subtract(diferenciaLunes, 'day');

        return Array.from({ length: 7 }).map((_, i) => lunes.add(i, 'day'));
    }, [fechaSeleccionada]);

    // --- CÁLCULO DE LA VISTA MENSUAL (CUADRÍCULA) ---
    const diasMes = useMemo(() => {
        const inicioMes = diaActualObj.startOf('month');
        const finMes = diaActualObj.endOf('month');

        const diaSemanaInicio = inicioMes.day();
        const diferenciaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1; // Ajuste para que Lunes sea el primer día

        const fechaInicialGrid = inicioMes.subtract(diferenciaInicio, 'day');

        // Siempre generamos 42 días (6 semanas) para que el grid no salte de tamaño entre meses
        return Array.from({ length: 42 }).map((_, i) => fechaInicialGrid.add(i, 'day'));
    }, [fechaSeleccionada]);

    return (
        <View className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col mb-4 w-full max-h-[400px]">

            {/* Controles: Día / Semana / Mes */}
            <View className="flex-row p-1 bg-surface-container-low border-b border-outline-variant/50">
                {(['dia', 'semana', 'mes'] as const).map((vista) => {
                    const isSelected = vistaActual === vista;
                    return (
                        <TouchableOpacity
                            key={vista}
                            onPress={() => setVistaActual(vista)}
                            className={`flex-1 py-2 items-center justify-center rounded-md ${isSelected ? 'bg-surface-container-lowest shadow-sm border border-outline-variant/50' : ''
                                }`}
                        >
                            <Text className={`font-label-lg font-semibold capitalize ${isSelected ? 'text-primary' : 'text-on-surface-variant'
                                }`}>
                                {vista}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Header del Calendario (< Mes Año >) */}
            <View className="flex-row items-center justify-between p-4 border-b border-surface-container-low">
                <TouchableOpacity onPress={() => navegar('atras')} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-surface-container">
                    <MaterialIcons name="chevron-left" size={24} color="#3e4949" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="font-headline-sm text-lg font-semibold text-on-surface capitalize">
                        {diaActualObj.format('MMMM YYYY')}
                    </Text>
                    <Text className="font-label-md text-xs text-outline capitalize">
                        {vistaActual === 'dia' ? diaActualObj.format('dddd, D') :
                            vistaActual === 'semana' ? `Semana del ${diasSemana[0].format('D MMM')}` : ''}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => navegar('adelante')} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-surface-container">
                    <MaterialIcons name="chevron-right" size={24} color="#3e4949" />
                </TouchableOpacity>
            </View>

            {/* --- CONTENIDO CONDICIONAL --- */}

            {/* 1. VISTA SEMANA (Scroll Horizontal) */}
            {vistaActual === 'semana' && (
                <View className="p-4">
                    <View className="flex-row justify-between w-full">
                        {diasSemana.map((dia, index) => {
                            const strDate = dia.format('YYYY-MM-DD');
                            const isHoy = strDate === hoyStr;
                            const isSelected = strDate === seleccionadoStr;

                            return (
                                <View key={index} className="items-center gap-1">
                                    <Text className="font-label-md text-xs text-outline">{diasSemanaNombres[index]}</Text>
                                    <TouchableOpacity
                                        onPress={() => setFechaSeleccionada(dia.toDate())}
                                        className={`h-10 w-10 flex items-center justify-center rounded-full ${isHoy ? 'bg-primary shadow-sm' : isSelected ? 'bg-primary/20' : ''}`}
                                    >
                                        <Text className={`font-label-lg ${isHoy ? 'text-on-primary font-bold' : isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
                                            {dia.format('D')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* 2. VISTA MES (Cuadrícula 7x6) */}
            {vistaActual === 'mes' && (
                <View className="p-4">
                    {/* Cabecera de días (L, M, M...) */}
                    <View className="flex-row w-full mb-2">
                        {diasSemanaNombres.map((dia, index) => (
                            <View key={`wd-${index}`} className="w-[14.28%] items-center">
                                <Text className="font-label-md font-medium text-outline">{dia}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Días del Mes */}
                    <View className="flex-row flex-wrap">
                        {diasMes.map((dia, index) => {
                            const strDate = dia.format('YYYY-MM-DD');
                            const isHoy = strDate === hoyStr;
                            const isSelected = strDate === seleccionadoStr;
                            const isMesActual = dia.month() === diaActualObj.month();

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setFechaSeleccionada(dia.toDate())}
                                    className="w-[14.28%] p-0.5 active:opacity-70"
                                >
                                    <View className={`h-10 w-full flex items-center justify-center rounded-full relative ${isHoy ? 'bg-primary shadow-sm' : isSelected ? 'bg-primary/20' : ''}`}>
                                        <Text className={`font-body-md text-base ${isHoy ? 'text-on-primary font-bold' : isSelected ? 'text-primary font-bold' : !isMesActual ? 'text-outline-variant' : 'text-on-surface'}`}>
                                            {dia.format('D')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}