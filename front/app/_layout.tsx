import '../global.css';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
    const token = useAuthStore((s) => s.token);
    const isLoading = useAuthStore((s) => s.isLoading);
    const loadSession = useAuthStore((s) => s.loadSession);

    useEffect(() => {
        loadSession();
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-surface">
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    if (!token) {
        return (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
            </Stack>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="registro" />
        </Stack>
    );
}
