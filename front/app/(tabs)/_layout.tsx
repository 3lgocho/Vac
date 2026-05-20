// app/(tabs)/_layout.tsx
import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

// Componente para el ícono adaptado 100% con Tailwind (NativeWind)
const TabIcon = ({ name, color, focused }: { name: any, color: string, focused: boolean }) => {
    return (
        <View className={`justify-center items-center p-2 rounded-2xl ${focused ? 'bg-teal-50 shadow-lg shadow-teal-600/40' : ''
            }`}>
            <MaterialIcons name={name} size={24} color={color} />
        </View>
    );
};

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                height: 75,
                backgroundColor: '#ffffff',
                borderTopWidth: 0,
            },
            tabBarActiveTintColor: '#008080', // Color Teal principal
            tabBarInactiveTintColor: '#9ca3af', // Gris inactivo (gray-400)
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                paddingBottom: 6,
            }
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name="home" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="agenda/index"
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name="calendar-month" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pacientes/index"
                options={{
                    title: 'Pacientes',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name="group" color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reportes/index"
                options={{
                    title: 'Reportes',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name="assignment" color={color} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}