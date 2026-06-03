import '../global.css';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
    const token = useAuthStore((s) => s.token);
    const isLoading = useAuthStore((s) => s.isLoading);
    const loadSession = useAuthStore((s) => s.loadSession);
    const segments = useSegments();
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
        loadSession();
    }, []);

    useEffect(() => {
        if (isLoading || !rootNavigationState?.key) return;

        if (!token) {
            if (segments[0] !== 'login') {
                router.replace('/login');
            }
        } else {
            if (!segments[0] || segments[0] === 'login') {
                router.replace('/(tabs)');
            }
        }
    }, [token, isLoading, segments, rootNavigationState?.key]);

    if (isLoading) {
        return (
            <SafeAreaProvider>
                <View className="flex-1 items-center justify-center bg-background">
                    <ActivityIndicator size="large" color="#008080" />
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="registro" />
            </Stack>
        </SafeAreaProvider>
    );
}
