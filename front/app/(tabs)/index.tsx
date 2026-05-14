import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';


export default function Dashboard() {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Top Section */}
        <View className="flex flex-row justify-between items-center px-margin-mobile py-stack-md pt-[32px]">
          <View>
            <Text className="font-headline-md text-headline-md text-on-surface">👋 Hola, Andreina Doe</Text>
          </View>
          <View>
            <Image
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyXWlJKlp21vjJAIIQUyIbu5b_uXAUvuA_POqNKTAt65UBBY8OeYsTDNUxbsfJbQuOTe6y_5Xz0PxTzq9HB7_gCym5EwzUgtV7O4bXjbAPRgTS6lEZIQMzWcsy41oCx-X1GjuptTXRmpNRXbJ6EKD5qmtRjPxHKTKElfZ0hylFrDQckuK66Og2wDerc4mAHuhUiSWCws44WO29yPKSc60BfeR5uewVpXPuYryqs-39AlfBlOEtcoVQp3Z3Jj8wYTZMmjVi87GBKRE" }}
              className="w-[48px] h-[48px] rounded-full border-2 border-surface-container-high"
            />
          </View>
        </View>

        {/* Search Section */}
        <View className="px-margin-mobile pb-stack-md">
          <View className="flex flex-row items-center gap-stack-sm">
            <View className="relative flex-grow justify-center">
              <Text className="material-symbols-outlined absolute left-3 z-10 text-outline">search</Text>
              <TextInput
                className="w-full h-touch-target-min pl-10 pr-4 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md text-body-md"
                placeholder="Buscar paciente por cédula o nombre..."
                placeholderTextColor="#6e7979"
              />
            </View>
            <TouchableOpacity className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant">
              <Text className="material-symbols-outlined text-on-surface">tune</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Section */}
        <View className="px-margin-mobile pb-stack-lg">
          <TouchableOpacity
            onPress={() => router.push('/registro/paso1')}
            className="w-full h-touch-target-min flex flex-row items-center justify-center gap-2 bg-primary rounded-xl"
          >
            <Text className="material-symbols-outlined text-on-primary">person_add</Text>
            <Text className="text-on-primary font-label-lg text-label-lg">AGREGAR NUEVO PACIENTE</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Patients Section */}
        <View className="px-margin-mobile">
          <Text className="font-headline-sm text-headline-sm text-on-surface mb-stack-md">Últimos pacientes agregados</Text>

          <View className="flex flex-col gap-stack-sm">
            {/* Patient Card 1 */}
            <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-row items-center justify-between relative overflow-hidden">
              <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></View>
              <View className="flex flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                  <Text className="text-on-primary-fixed font-label-lg text-label-lg">CM</Text>
                </View>
                <View>
                  <Text className="font-label-lg text-label-lg text-on-surface">Carlos Mendoza</Text>
                  <Text className="font-body-md text-body-md text-on-surface-variant text-sm">V-12.345.678</Text>
                </View>
              </View>
              <View className="items-end">
                <View className="flex flex-row items-center gap-1 bg-primary-fixed/20 px-2 py-1 rounded-lg">
                  <Text className="material-symbols-outlined text-[14px] text-primary">vaccines</Text>
                  <Text className="font-label-md text-label-md text-primary">Covid-19</Text>
                </View>
                <Text className="font-body-md text-body-md text-outline text-xs mt-1">Hoy, 10:30 AM</Text>
              </View>
            </View>

            {/* Patient Card 2 */}
            <View className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-row items-center justify-between relative overflow-hidden">
              <View className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></View>
              <View className="flex flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
                  <Text className="text-on-secondary-fixed font-label-lg text-label-lg">LR</Text>
                </View>
                <View>
                  <Text className="font-label-lg text-label-lg text-on-surface">Lucia Rodriguez</Text>
                  <Text className="font-body-md text-body-md text-on-surface-variant text-sm">V-23.456.789</Text>
                </View>
              </View>
              <View className="items-end">
                <View className="flex flex-row items-center gap-1 bg-secondary-fixed/20 px-2 py-1 rounded-lg">
                  <Text className="material-symbols-outlined text-[14px] text-secondary">calendar_month</Text>
                  <Text className="font-label-md text-label-md text-secondary">Agendado</Text>
                </View>
                <Text className="font-body-md text-body-md text-outline text-xs mt-1">Mañana</Text>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}