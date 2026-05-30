import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, FlatList, ActivityIndicator, Modal, ScrollView, Animated, Keyboard, LayoutAnimation, Platform, UIManager, Alert, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useBusquedaPacientes, FiltroEstado } from '../../hooks/useBusquedaPacientes';
import { useNextVaccines } from '../../hooks/useNextVaccines';
import { PacienteCard } from '../../components/PacienteCard';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../hooks/useApi';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function jwtPayload(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    return JSON.parse(decodeURIComponent(binary.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
}

export default function Dashboard() {
  const router = useRouter();
  const authNombre = useAuthStore(s => s.nombre);
  const authRol = useAuthStore(s => s.rol);
  const authToken = useAuthStore(s => s.token);
  const logout = useAuthStore(s => s.logout);
  const primerNombre = authNombre?.split(' ')[0] || 'Usuario';

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoActivo, setEstadoActivo] = useState<FiltroEstado>('todos');
  const [modalFiltros, setModalFiltros] = useState(false);
  const [menuPerfil, setMenuPerfil] = useState(false);
  const [modalPin, setModalPin] = useState(false);
  const [nuevoPin, setNuevoPin] = useState('');
const [confirmLogout, setConfirmLogout] = useState(false);
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
            <Text className="font-headline-md text-headline-md text-on-surface">👋 Hola, {primerNombre}</Text>
            <Text className="font-body-sm text-body-sm text-on-surface-variant">Ambulatorio Los Robles</Text>
          </View>
          <TouchableOpacity onPress={() => setMenuPerfil(true)}>
            <View className="w-[48px] h-[48px] rounded-full border-2 border-primary items-center justify-center bg-surface-container-high">
              <Text className="text-lg font-bold text-primary">{authNombre?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          </TouchableOpacity>
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
            onPress={() => setModalFiltros(true)}
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
        visible={modalFiltros}
        onRequestClose={() => setModalFiltros(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-surface-container-lowest rounded-t-3xl p-6">
            <View className="flex flex-row justify-between items-center mb-6">
              <Text className="font-headline-sm text-on-surface">Filtrar Pacientes</Text>
              <TouchableOpacity onPress={() => setModalFiltros(false)}>
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
              onPress={() => setModalFiltros(false)}
              className="w-full h-touch-target-min bg-primary rounded-xl items-center justify-center"
            >
              <Text className="text-on-primary font-label-lg">APLICAR FILTROS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Perfil - Menú */}
      <Modal visible={menuPerfil} transparent animationType="fade" onRequestClose={() => setMenuPerfil(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setMenuPerfil(false)} className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl p-5 pb-10">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full border-2 border-primary items-center justify-center bg-surface-container-high mb-2">
                <Text className="text-2xl font-bold text-primary">{authNombre?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
              <Text className="text-lg font-bold text-on-surface">{authNombre}</Text>
              <Text className="text-sm text-on-surface-variant">{authRol === 'coordinador' ? 'Coordinador' : 'Enfermero'}</Text>
            </View>

            {authRol === 'coordinador' && (
              <TouchableOpacity onPress={() => { setMenuPerfil(false); setModalPin(true); }} className="flex-row items-center p-4 border-b border-outline-variant">
                <MaterialIcons name="password" size={24} color="#3e4949" />
                <Text className="text-base ml-4 font-medium text-on-surface">Cambiar PIN</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => { setMenuPerfil(false); setConfirmLogout(true); }} className="flex-row items-center p-4">
              <MaterialIcons name="logout" size={24} color="#ba1a1a" />
              <Text className="text-base ml-4 font-medium text-error">Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cambiar PIN Modal */}
      <Modal visible={modalPin} transparent animationType="fade" onRequestClose={() => setModalPin(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-black/50 justify-center p-5">
          <View className="bg-surface rounded-2xl p-6">
            <Text className="text-xl font-bold text-on-surface mb-2">Cambiar PIN</Text>
            <Text className="text-on-surface-variant mb-4">Ingresa el nuevo PIN de acceso.</Text>

            <TextInput
              className="bg-surface-container border border-outline-variant rounded-lg p-4 mb-6 text-on-surface text-center text-2xl tracking-widest"
              placeholder="****"
              keyboardType="numeric"
              secureTextEntry
              maxLength={8}
              value={nuevoPin}
              onChangeText={setNuevoPin}
              autoFocus
            />

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setModalPin(false)} className="px-5 py-3 rounded-lg">
                <Text className="text-primary font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                if (!nuevoPin || nuevoPin.length < 4) {
                  Alert.alert('Error', 'El PIN debe tener al menos 4 caracteres');
                  return;
                }
                try {
                  const payload = jwtPayload(authToken || '');
                  if (!payload?.sub) throw new Error('No se pudo obtener el ID del usuario');
                  await apiFetch(`/personal/${payload.sub}/pin`, {
                    method: 'PATCH',
                    body: JSON.stringify({ pin: nuevoPin }),
                  });
                  Alert.alert('Éxito', 'PIN actualizado correctamente');
                  setModalPin(false);
                  setNuevoPin('');
                } catch (err: any) {
                  Alert.alert('Error', err.message);
                }
              }} className="bg-primary px-5 py-3 rounded-lg">
                <Text className="text-white font-semibold">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Confirmación cerrar sesión */}
      <Modal visible={confirmLogout} transparent animationType="fade" onRequestClose={() => setConfirmLogout(false)}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-surface rounded-2xl p-6 items-center w-full max-w-sm">
            <MaterialIcons name="logout" size={48} color="#ba1a1a" className="mb-4" />
            <Text className="text-xl font-bold text-on-surface mb-2 text-center">Cerrar Sesión</Text>
            <Text className="text-on-surface-variant text-center mb-6">¿Estás seguro que deseas cerrar sesión?</Text>
            <View className="flex-row gap-4 w-full">
              <TouchableOpacity onPress={() => setConfirmLogout(false)} className="flex-1 py-3 rounded-lg border border-outline-variant items-center">
                <Text className="text-on-surface font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { setConfirmLogout(false); await logout(); }} className="flex-1 py-3 rounded-lg items-center bg-error">
                <Text className="text-white font-semibold">Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
