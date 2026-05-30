import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const [cedula, setCedula] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError(null);
        if (!cedula.trim()) {
            setError('Ingresa tu cédula');
            return;
        }
        if (!pin.trim() || pin.length < 4) {
            setError('Ingresa tu PIN de 4 dígitos');
            return;
        }
        setLoading(true);
        const err = await login(cedula.trim(), pin.trim());
        setLoading(false);
        if (err) {
            setError(err);
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center px-6"
            >
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-primary-container rounded-full items-center justify-center mb-4">
                        <MaterialIcons name="vaccines" size={32} color="#008080" />
                    </View>
                    <Text className="text-primary font-semibold text-xl tracking-tight">
                        Vacunación
                    </Text>
                    <Text className="text-on-surface-variant text-sm mt-1">
                        Sistema de Agenda Vacunal
                    </Text>
                </View>

                <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-5 gap-4">
                    <View>
                        <Text className="text-on-surface-variant text-xs font-medium mb-1 ml-1">
                            Cédula de Identidad
                        </Text>
                        <TextInput
                            value={cedula}
                            onChangeText={setCedula}
                            placeholder="Ej: 12345678"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            maxLength={15}
                            className="border border-outline-variant rounded-lg px-4 py-3.5 text-on-surface bg-surface-container-low font-body-md text-base"
                            autoFocus
                        />
                    </View>

                    <View>
                        <Text className="text-on-surface-variant text-xs font-medium mb-1 ml-1">
                            PIN
                        </Text>
                        <TextInput
                            value={pin}
                            onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 6))}
                            placeholder="••••"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={6}
                            className="border border-outline-variant rounded-lg px-4 py-3.5 text-on-surface bg-surface-container-low font-body-md text-base tracking-widest"
                        />
                    </View>

                    {error && (
                        <View className="bg-error-container rounded-lg px-4 py-3 flex-row items-center gap-2">
                            <MaterialIcons name="error-outline" size={18} color="#DC2626" />
                            <Text className="text-error font-body-md text-sm flex-1">{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className="bg-primary py-4 rounded-xl items-center active:opacity-80 disabled:opacity-50"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text className="text-white font-bold text-base">Ingresar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-6">
                    <MaterialIcons name="help-outline" size={16} color="#9CA3AF" />
                    <Text className="text-on-surface-variant text-xs text-center mt-1">
                        ¿Problemas para acceder? Contacta a la administración del ambulatorio para reiniciar tu acceso.
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
