import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEstadisticasStore } from '../../../store/estadisticasStore';
import { ChartCard } from '../../../components/Estadisticas/ChartCard';
import { Ionicons } from '@expo/vector-icons';

type PeriodType = 'mensual' | 'bimestral' | 'trimestral';
const NOMBRES_MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function ReportesScreen() {
    const { datos, isLoading, fetchEstadisticas, error } = useEstadisticasStore();
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [periodType, setPeriodType] = useState<PeriodType>('trimestral');
    
    const [periodIndex, setPeriodIndex] = useState(() => {
        const m = new Date().getMonth();
        return Math.floor(m / 3);
    });

    useEffect(() => {
        let mesInicio = 1;
        let mesFin = 12;

        if (periodType === 'mensual') {
            mesInicio = periodIndex + 1;
            mesFin = periodIndex + 1;
        } else if (periodType === 'bimestral') {
            mesInicio = periodIndex * 2 + 1;
            mesFin = periodIndex * 2 + 2;
        } else if (periodType === 'trimestral') {
            mesInicio = periodIndex * 3 + 1;
            mesFin = periodIndex * 3 + 3;
        }

        fetchEstadisticas(anio, mesInicio, mesFin);
    }, [anio, periodType, periodIndex]);

    const getPeriodLabel = () => {
        if (periodType === 'mensual') return NOMBRES_MESES[periodIndex];
        if (periodType === 'bimestral') return `${NOMBRES_MESES[periodIndex * 2]}-${NOMBRES_MESES[periodIndex * 2 + 1]}`;
        if (periodType === 'trimestral') return `Trim. ${periodIndex + 1}`;
        return '';
    };

    const maxIndex = periodType === 'mensual' ? 11 : periodType === 'bimestral' ? 5 : 3;

    const prevPeriod = () => setPeriodIndex(i => i > 0 ? i - 1 : maxIndex);
    const nextPeriod = () => setPeriodIndex(i => i < maxIndex ? i + 1 : 0);

    const changeType = (type: PeriodType) => {
        setPeriodType(type);
        if (type === 'mensual') setPeriodIndex(new Date().getMonth());
        else if (type === 'bimestral') setPeriodIndex(Math.floor(new Date().getMonth() / 2));
        else setPeriodIndex(Math.floor(new Date().getMonth() / 3));
    };

    const mesesLabels = datos.map(d => NOMBRES_MESES[d.mes - 1] || `Mes ${d.mes}`);

    const generoDataSet = [
        { data: datos.map(d => ({ value: d.genero_f })), color: '#ec4899', dataPointsColor: '#ec4899' },
        { data: datos.map(d => ({ value: d.genero_m })), color: '#3b82f6', dataPointsColor: '#3b82f6' }
    ];

    const edadDataSet = [
        { data: datos.map(d => ({ value: d.edad_0_11_meses })), color: '#f59e0b', dataPointsColor: '#f59e0b' },
        { data: datos.map(d => ({ value: d.edad_1_4_anos })), color: '#10b981', dataPointsColor: '#10b981' },
        { data: datos.map(d => ({ value: d.edad_5_19_anos })), color: '#8b5cf6', dataPointsColor: '#8b5cf6' },
        { data: datos.map(d => ({ value: d.edad_20_59_anos })), color: '#ef4444', dataPointsColor: '#ef4444' },
        { data: datos.map(d => ({ value: d.edad_60_79_anos })), color: '#14b8a6', dataPointsColor: '#14b8a6' },
        { data: datos.map(d => ({ value: d.edad_80_mas })), color: '#64748b', dataPointsColor: '#64748b' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-4 py-4 bg-surface border-b border-outline-variant/30 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-on-surface">Estadísticas</Text>
            </View>

            {/* Selector de Tipo de Período */}
            <View className="px-4 pt-4 flex-row justify-center gap-2">
                {(['mensual', 'bimestral', 'trimestral'] as PeriodType[]).map(type => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => changeType(type)}
                        className={`px-3 py-1.5 rounded-full ${periodType === type ? 'bg-primary' : 'bg-surface-variant/30'}`}
                    >
                        <Text className={`capitalize font-bold text-xs ${periodType === type ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                            {type === 'mensual' ? '1 Mes' : type === 'bimestral' ? '2 Meses' : '3 Meses'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Controles de Filtro (Año y Periodo) */}
            <View className="px-4 py-4 flex-row gap-4 items-center justify-between">
                <View className="flex-1 flex-row items-center bg-surface-variant/30 rounded-xl px-2 py-1">
                    <TouchableOpacity onPress={() => setAnio(a => a - 1)} className="p-2">
                        <Ionicons name="chevron-back" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center font-bold">{anio}</Text>
                    <TouchableOpacity onPress={() => setAnio(a => a + 1)} className="p-2">
                        <Ionicons name="chevron-forward" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 flex-row items-center bg-surface-variant/30 rounded-xl px-2 py-1">
                    <TouchableOpacity onPress={prevPeriod} className="p-2">
                        <Ionicons name="chevron-back" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center font-bold">{getPeriodLabel()}</Text>
                    <TouchableOpacity onPress={nextPeriod} className="p-2">
                        <Ionicons name="chevron-forward" size={20} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-2">
                {isLoading ? (
                    <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
                ) : error ? (
                    <Text className="text-error text-center mt-10">{error}</Text>
                ) : datos.length > 0 ? (
                    <>
                        <ChartCard
                            title="Género por Tiempo"
                            labels={mesesLabels}
                            legend={['Femenino', 'Masculino']}
                            dataSet={generoDataSet}
                        />

                        <ChartCard
                            title="Rango de Edad por Tiempo"
                            labels={mesesLabels}
                            legend={['< 1 año', '1-4', '5-19', '20-59', '60-79', '80+']}
                            dataSet={edadDataSet}
                        />
                    </>
                ) : (
                    <Text className="text-on-surface-variant text-center mt-10">No hay datos para este período.</Text>
                )}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}