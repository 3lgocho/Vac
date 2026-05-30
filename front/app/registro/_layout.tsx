import { Stack } from 'expo-router';
import { View } from 'react-native';
import { TopBarRegistro } from '../../components/top_bar';
import { ProgressBarRegistro } from '../../components/ProgressBarRegistro'; // <-- Importalo aquí

export default function RegistroLayout() {
    return (
        <View className="flex-1 bg-background">

            <TopBarRegistro />

            {/* Este componente ahora vivirá aquí y se actualizará solo */}
            <View className="flex w-full max-w-2xl mx-auto">
                <ProgressBarRegistro />
            </View>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="paso1" />
                <Stack.Screen name="paso2" />
                <Stack.Screen name="paso3" />
            </Stack>
        </View>
    );
}