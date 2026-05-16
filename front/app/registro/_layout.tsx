import { Stack } from 'expo-router';
import { View } from 'react-native';
import { TopBarRegistro } from '../../components/top_bar'; // Tu componente visual

export default function RegistroLayout() {
    return (
        <View style={{ flex: 1 }}>
            {/* El Top Bar se renderiza de forma fija fuera del Stack animado */}
            <TopBarRegistro />

            {/* Las pantallas cambian internamente debajo del Top Bar */}
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="paso1" />
                <Stack.Screen name="paso2" />
                <Stack.Screen name="paso3" />
            </Stack>
        </View>
    );
}