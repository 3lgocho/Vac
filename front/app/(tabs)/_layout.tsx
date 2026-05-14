// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import '../../global.css';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: { height: 80, paddingBottom: 20 },
            tabBarActiveTintColor: '#008080', // Tu color primary-container
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontFamily: 'Material Symbols Outlined', fontSize: 24, color }}>home</Text>
                    ),
                }}
            />
            {/* Aquí puedes añadir más pestañas como Agenda, Pacientes, etc. */}
        </Tabs>
    );
}