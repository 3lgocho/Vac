// app/_layout.tsx
import '../global.css'; // Importante para NativeWind v4
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Grupo de pestañas principales (Dashboard, etc) */}
            <Stack.Screen name="(tabs)" />

            {/* Pantallas del flujo de registro */}
            <Stack.Screen name="registro/paso1" />
            <Stack.Screen name="registro/paso2" />
            <Stack.Screen name="registro/paso3" />
        </Stack>
    );
}