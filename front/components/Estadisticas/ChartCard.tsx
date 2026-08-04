import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface ChartCardProps {
    title: string;
    dataSet: { data: any[]; color: string; dataPointsColor?: string; }[];
    labels: string[];
    legend?: string[];
    colors?: string[];
}

export function ChartCard({ title, dataSet, labels, legend, colors = [] }: ChartCardProps) {
    const screenWidth = Dimensions.get('window').width;
    
    return (
        <View className="bg-surface rounded-xl p-4 shadow-sm mb-6 w-full">
            <Text className="text-lg font-bold text-on-surface mb-4">{title}</Text>
            
            <View className="flex-row mb-6 justify-center flex-wrap gap-y-2">
                {legend?.map((item, index) => (
                    <View key={index} className="flex-row items-center mr-4">
                        <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: dataSet[index]?.color || colors[index % colors.length] }} />
                        <Text className="text-on-surface-variant text-sm">{item}</Text>
                    </View>
                ))}
            </View>

            <View className="items-center overflow-hidden">
                <LineChart
                    dataSet={dataSet.map(d => ({
                        ...d,
                        startOpacity: 0.2,
                        endOpacity: 0.05,
                        thickness: 3
                    }))}
                    curved
                    areaChart
                    spacing={(screenWidth - 140) / 2} // Fit 3 points nicely
                    initialSpacing={20}
                    yAxisColor="#ccc"
                    xAxisColor="#ccc"
                    yAxisTextStyle={{ color: '#666', fontSize: 12 }}
                    xAxisLabelTexts={labels}
                    xAxisLabelTextStyle={{ color: '#666', fontSize: 12, textAlign: 'center' }}
                    hideRules
                    width={screenWidth - 100}
                />
            </View>
        </View>
    );
}
