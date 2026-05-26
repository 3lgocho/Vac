import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, FlatList, ActivityIndicator, Modal, ScrollView, Animated, Keyboard, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useBusquedaPacientes, FiltroEstado } from '../../hooks/useBusquedaPacientes';
import { useNextVaccines } from '../../hooks/useNextVaccines';
import { PacienteCard } from '../../components/PacienteCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Dashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoActivo, setEstadoActivo] = useState<FiltroEstado>('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const greetingAnim = useRef(new Animated.Value(1)).current;

  const { pacientes, loading, loadingMore, fetchPacientes, loadMore } = useBusquedaPacientes();

  const patientIds = useMemo(() => pacientes.map(p => p.id), [pacientes]);
  const nextVaccines = useNextVaccines(patientIds);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    Animated.timing(greetingAnim, {
      toValue: isSearching || isKeyboardVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSearching, isKeyboardVisible]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPacientes(searchTerm, estadoActivo, 1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, estadoActivo, fetchPacientes]);

  const clearSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchTerm('');
    searchInputRef.current?.blur();
    setIsSearching(false);
  };

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
      <Animated.View
        pointerEvents={isSearching || isKeyboardVisible ? 'none' : 'auto'}
        style={{
          opacity: greetingAnim,
          transform: [{
            translateY: greetingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-60, 0],
            }),
          }],
          maxHeight: greetingAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100],
          }),
          overflow: 'hidden',
        }}
      >
        <View className="flex flex-row w-full justify-between items-center px-margin-mobile pt-[48px] pb-stack-lg mb-stack-md border-b border-gray-200">
          <View>
            <Text className="font-headline-md text-headline-md text-on-surface">👋 Hola, Andreina</Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">Centro de Vacunación</Text>
          </View>
          <Image source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyXWlJKlp21vjJAIIQUyIbu5b_uXAUvuA_POqNKTAt65UBBY8OeYsTDNUxbsfJbQuOTe6y_5Xz0PxTzq9HB7_gCym5EwzUgtV7O4bXjbAPRgTS6lEZIQMzWcsy41oCx-X1GjuptTXRmpNRXbJ6EKD5qmtRjPxHKTKElfZ0hylFrDQckuK66Og2wDerc4mAHuhUiSWCws44WO29yPKSc60BfeR5uewVpXPuYryqs-39AlfBlOEtcoVQp3Z3Jj8wYTZMmjVi87GBKRE" }} className="w-[48px] h-[48px] rounded-full border-2 border-primary" />
        </View>
      </Animated.View>

      <View className="pb-stack-sm pt-2">
        <View className="flex flex-row items-center gap-stack-sm">
          <View className="relative flex-grow justify-center">
            <MaterialIcons name="search" size={24} className="absolute left-3 z-10" color="#4B5563" />
            <TextInput
              ref={searchInputRef}
              onFocus={() => setIsSearching(true)}
              onBlur={() => { if (!searchTerm) setIsSearching(false); }}
              className="w-full h-touch-target-min pl-10 pr-10 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md"
              placeholder="Buscar por cédula o nombre..."
              placeholderTextColor="#6e7979"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="absolute right-3 z-10 p-1">
                <MaterialIcons name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant"
          >
            <MaterialIcons name="tune" size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="pb-stack-md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip label="Todos" value="todos" />
          <FilterChip label="Agendados" value="agendados" />
          <FilterChip label="Atrasados" value="atrasados" />
        </ScrollView>
      </View>

      <Text className="font-headline-sm text-on-surface mb-stack-md px-margin-mobile">
        {searchTerm || estadoActivo !== 'todos' ? 'Resultados' : 'Últimos pacientes'}
      </Text>
    </>
  );

  const renderEmptyState = () => {
    if (loading) return <ActivityIndicator size="large" color="#005b52" className="mt-10" />;

    if (searchTerm.length > 0 && !loading) {
      const searchDisplay = searchTerm.startsWith('V-') || searchTerm.startsWith('E-') ? searchTerm : `V-${searchTerm}`;
      return (
        <View className="items-center mt-10 px-4">
          <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
          <Text className="text-center text-on-surface-variant mt-4 mb-6 text-base">
            No se encontraron pacientes con "{searchTerm}"
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/registro/paso1')}
            className="w-full h-touch-target-min flex flex-row items-center justify-center gap-2 bg-primary rounded-xl"
          >
            <MaterialIcons name="person-add" size={24} color="#fff" />
            <Text className="text-on-primary font-label-lg text-label-lg">Añadir nuevo paciente: {searchDisplay}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <Text className="text-center text-on-surface-variant mt-10">No se encontraron pacientes.</Text>;
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-margin-mobile"
        renderItem={({ item }) => (
          <PacienteCard
            nombre={item.nombre}
            apellido={item.apellido}
            cedula={`${item.nacionalidad}-${item.cedula}`}
            nextVaccine={nextVaccines[item.id]}
            onPress={() => router.push(`/pacientes/${item.id}`)}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#005b52" className="my-4" /> : null}
      />

      {!isKeyboardVisible && !isSearching && (
        <TouchableOpacity
          onPress={() => router.push('/registro/paso1')}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg elevation-5"
        >
          <MaterialIcons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      )}

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
