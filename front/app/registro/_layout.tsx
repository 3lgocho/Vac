import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBarRegistro } from '../../components/top_bar';
import { ProgressBarRegistro } from '../../components/ProgressBarRegistro';

export default function RegistroLayout() {
    return (
        <SafeAreaView className="flex-1 bg-background">

            <TopBarRegistro />

            {/* Este componente ahora vivirá aquí y se actualizará solo */}
            <View className="flex w-full max-w-2xl mx-auto px-margin-mobile">
                <ProgressBarRegistro />
            </View>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="paso1" />
                <Stack.Screen name="paso2" />
                <Stack.Screen name="paso3" />
            </Stack>
        </SafeAreaView>
    );
}