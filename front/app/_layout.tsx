import '../global.css';
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Navegación por pestañas principales */}
            <Stack.Screen name="(tabs)" />

            {/* Flujo completo de registro (Expo Router buscará el layout interno) */}
            <Stack.Screen name="registro" />
        </Stack>
    );
}