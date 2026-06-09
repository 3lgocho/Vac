// app/(tabs)/_layout.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

// Componente que imita la estructura de tu HTML
const TabItem = ({ name, title, focused }: { name: any, title: string, focused: boolean }) => {
    return (
        <View className={`flex flex-col items-center justify-center transition-all ${focused
                ? 'bg-primary rounded-full px-4 py-1.5 min-w-[4rem]' // Píldora activa (Tu color primary)
                : 'bg-transparent w-16 h-14' // Estado inactivo
            }`}>
            <MaterialIcons
                name={name}
                size={24}
                color={focused ? '#ffffff' : '#6b7280'} // Blanco si está activo, gris (on-surface-variant) si no
            />
            <Text className={`text-[11px] mt-1 ${focused ? 'text-white font-semibold' : 'text-gray-500 font-medium'
                }`}>
                {title}
            </Text>
        </View>
    );
};

export default function TabsLayout() {
    const rol = useAuthStore(state => state.rol);

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarShowLabel: false, // ¡Clave! Ocultamos el texto por defecto para controlarlo nosotros en TabItem
            tabBarStyle: {
                height: 85, // Ajustado para dar espacio a la píldora
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb', // outline-variant
                paddingTop: 10,
                paddingBottom: 15, // Espacio inferior para iOS/Android
                elevation: 0, // Quitamos sombra extra de Android si queremos el estilo flat del HTML
            },
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem name="home" title="Inicio" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="agenda/index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem name="calendar-today" title="Agenda" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pacientes/index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem name="groups" title="Pacientes" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reportes/index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem name="analytics" title="Reportes" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="personal/index"
                options={{
                    href: rol === 'coordinador' ? '/personal' : null,
                    tabBarIcon: ({ focused }) => (
                        <TabItem name="badge" title="Personal" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="logs/index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem name="history" title="Historial" focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}