import '../global.css';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
    const token = useAuthStore((s) => s.token);
    const isLoading = useAuthStore((s) => s.isLoading);
    const loadSession = useAuthStore((s) => s.loadSession);

    useEffect(() => {
        loadSession();
    }, []);

    let content;
    if (isLoading) {
        content = (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    } else if (!token) {
        content = (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
            </Stack>
        );
    } else {
        content = (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="registro" />
            </Stack>
        );
    }

    return (
        <SafeAreaProvider>
            {content}
        </SafeAreaProvider>
    );
}

