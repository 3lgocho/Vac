import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, FlatList, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useBusquedaPacientes, FiltroEstado } from '../../hooks/useBusquedaPacientes';
import { PacienteCard } from '../../components/PacienteCard';

export default function Dashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoActivo, setEstadoActivo] = useState<FiltroEstado>('todos');
  const [modalVisible, setModalVisible] = useState(false);

  const { pacientes, loading, loadingMore, fetchPacientes, loadMore } = useBusquedaPacientes();

  // Debounce para la búsqueda de texto + filtro de estado
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPacientes(searchTerm, estadoActivo, 1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, estadoActivo, fetchPacientes]);

  // Componente de Tag (Chip)
  const FilterChip = ({ label, value }: { label: string, value: FiltroEstado }) => {
    const isSelected = estadoActivo === value;
    return (
      <TouchableOpacity
        onPress={() => setEstadoActivo(value)}
        className={`px-4 py-2 rounded-full border mr-2 ${isSelected
          ? 'bg-primary border-primary'
          : 'bg-surface-container-lowest border-outline-variant'
          }`}
      >
        <Text className={`font-label-md ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View className="flex flex-row w-full justify-between items-center px-margin-mobile pt-[48px] pb-stack-lg bg-white mb-stack-md border-b border-gray-200">
        <View>
          <Text className="font-headline-md text-headline-md text-on-surface">👋 Hola, Andreina</Text>
          <Text className="font-body-sm text-body-sm text-on-surface-variant">Centro de Vacunación</Text>
        </View>
        <Image source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyXWlJKlp21vjJAIIQUyIbu5b_uXAUvuA_POqNKTAt65UBBY8OeYsTDNUxbsfJbQuOTe6y_5Xz0PxTzq9HB7_gCym5EwzUgtV7O4bXjbAPRgTS6lEZIQMzWcsy41oCx-X1GjuptTXRmpNRXbJ6EKD5qmtRjPxHKTKElfZ0hylFrDQckuK66Og2wDerc4mAHuhUiSWCws44WO29yPKSc60BfeR5uewVpXPuYryqs-39AlfBlOEtcoVQp3Z3Jj8wYTZMmjVi87GBKRE" }} className="w-[48px] h-[48px] rounded-full border-2 border-primary" />
      </View>

      {/* Search & Filter Section */}
      <View className="px-margin-mobile pb-stack-sm">
        <View className="flex flex-row items-center gap-stack-sm">
          <View className="relative flex-grow justify-center">
            <MaterialIcons name="search" size={24} className="absolute left-3 z-10" color="#4B5563" />
            <TextInput
              className="w-full h-touch-target-min pl-10 pr-4 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md"
              placeholder="Buscar por cédula o nombre..."
              placeholderTextColor="#6e7979"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant"
          >
            <MaterialIcons name="tune" size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Tags (Chips) */}
      <View className="pl-margin-mobile pb-stack-md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip label="Todos" value="todos" />
          <FilterChip label="Agendados" value="agendados" />
          <FilterChip label="Atrasados" value="atrasados" />
        </ScrollView>
      </View>

      <View className="px-margin-mobile pb-stack-lg">
        <TouchableOpacity
          onPress={() => router.push('/registro/paso1')}
          className="w-full h-touch-target-min flex flex-row items-center justify-center gap-2 bg-primary rounded-xl"
        >
          <MaterialIcons name="person-add" size={24} color="#fff" />
          <Text className="text-on-primary font-label-lg">AGREGAR NUEVO PACIENTE</Text>
        </TouchableOpacity>
      </View>

      <Text className="font-headline-sm text-on-surface mb-stack-md px-margin-mobile">
        {searchTerm || estadoActivo !== 'todos' ? 'Resultados de búsqueda' : 'Últimos pacientes'}
      </Text>
    </>
  );

  return (
    <SafeAreaView className="bg-background flex-1">
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 80 }}
        className="px-margin-mobile"
        renderItem={({ item }) => (
          <PacienteCard
            nombre={item.nombre}
            apellido={item.apellido}
            cedula={`${item.nacionalidad}-${item.cedula}`}
            vacuna="Registro"
            dosis="N/A"
            esAtrasada={estadoActivo === 'atrasados'} // Simulación visual temporal
            onPress={() => router.push(`/pacientes/${item.id}`)}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color="#005b52" className="mt-10" />
            : <Text className="text-center text-on-surface-variant mt-10">No se encontraron pacientes.</Text>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#005b52" className="my-4" /> : null}
      />

      {/* Mini Modal para Filtros (Bottom Sheet Style) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-surface-container-lowest rounded-t-3xl p-6">
            <View className="flex flex-row justify-between items-center mb-6">
              <Text className="font-headline-sm text-on-surface">Filtrar Pacientes</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text className="font-label-lg text-on-surface mb-3">Estado de Vacunación</Text>
            <View className="flex flex-row flex-wrap gap-2 mb-6">
              <FilterChip label="Todos" value="todos" />
              <FilterChip label="Agendados" value="agendados" />
              <FilterChip label="Atrasados" value="atrasados" />
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="w-full h-touch-target-min bg-primary rounded-xl items-center justify-center"
            >
              <Text className="text-on-primary font-label-lg">APLICAR FILTROS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}