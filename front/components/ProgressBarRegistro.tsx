import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

export function ProgressBarRegistro() {
    const pathname = usePathname();

    let pasoActual = 1;
    let titulo = "Identificación";

    if (pathname.includes('paso2')) {
        pasoActual = 2;
        titulo = "Datos personales";
    } else if (pathname.includes('paso3')) {
        pasoActual = 3;
        titulo = "Inmunización";
    }

    const porcentaje = (pasoActual / 3) * 100;
    const widthAnim = useSharedValue(0);

    useEffect(() => {
        widthAnim.value = withTiming(porcentaje, {
            duration: 600,
            easing: Easing.out(Easing.cubic),
        });
    }, [pathname, porcentaje]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${widthAnim.value}%`,
        };
    });

    return (
        <View className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-gutter mt-4 mb-2 w-full max-w-4xl self-center">
            <View className="flex flex-row justify-between items-center mb-stack-sm">
                <Text className="font-label-md text-label-md text-on-surface">Paso {pasoActual} de 3</Text>
                <Text className="font-label-lg text-label-lg text-primary">{titulo}</Text>
            </View>

            {/* Contenedor del fondo gris */}
            <View className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">

                {/* EL FIX ESTÁ AQUÍ: 
                  Quitamos className y forzamos el alto, el color (#008080) y el border-radius 
                  directamente en el array de estilos junto con la animación.
                */}
                <Animated.View
                    style={[
                        { height: '100%', backgroundColor: '#008080', borderRadius: 999 },
                        animatedStyle
                    ]}
                />

            </View>
        </View>
    );
}