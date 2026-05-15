// app/(tabs)/_layout.tsx
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';


export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: { height: 80, paddingBottom: 20 },
            tabBarActiveTintColor: '#008080',
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home" size={24} color={color} />
                    ),
                }}
            />
            {/* Aquí puedes añadir más pestañas como Agenda, Pacientes, etc. */}
        </Tabs>
    );
}