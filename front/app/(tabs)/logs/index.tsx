import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Animated, Keyboard, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLogs } from '../../../hooks/useLogs';
import { LogCard } from '../../../components/LogCard';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LogsScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const headerAnim = useRef(new Animated.Value(1)).current;

  const { logs, loading, loadingMore, fetchLogs, loadMore } = useLogs();

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: isSearching || isKeyboardVisible ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSearching, isKeyboardVisible]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs(searchTerm, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchLogs]);

  const fetchRef = useRef(fetchLogs);
  const searchRef = useRef(searchTerm);

  useEffect(() => {
    fetchRef.current = fetchLogs;
    searchRef.current = searchTerm;
  }, [fetchLogs, searchTerm]);

  useFocusEffect(
    useCallback(() => {
      fetchRef.current(searchRef.current, true);
    }, [])
  );

  const clearSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchTerm('');
    searchInputRef.current?.blur();
    setIsSearching(false);
  };

  const ListHeader = () => (
    <>
      <View className="pb-stack-md pt-6">
        <View className="flex flex-row items-center gap-stack-sm">
          <View className="relative flex-grow justify-center">
            <MaterialIcons name="search" size={24} className="absolute left-3 z-10" color="#4B5563" />
            <TextInput
              ref={searchInputRef}
              onFocus={() => setIsSearching(true)}
              onBlur={() => { if (!searchTerm) setIsSearching(false); }}
              className="w-full h-touch-target-min pl-10 pr-10 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-body-md"
              placeholder="Buscar por cédula, paciente, vacuna..."
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
        </View>
      </View>

      <Text className="font-headline-sm text-on-surface mb-stack-md">
        {searchTerm ? 'Resultados de búsqueda' : 'Últimos movimientos'}
      </Text>
    </>
  );

  const renderEmptyState = () => {
    if (loading) return <ActivityIndicator size="large" color="#005b52" className="mt-10" />;

    if (searchTerm.length > 0 && !loading) {
      return (
        <View className="items-center mt-10 px-4">
          <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
          <Text className="text-center text-on-surface-variant mt-4 text-base">
            No se encontraron registros que coincidan con "{searchTerm}"
          </Text>
        </View>
      );
    }

    return <Text className="text-center text-on-surface-variant mt-10">No hay registros de auditoría disponibles.</Text>;
  };

  return (
    <SafeAreaView className="bg-background flex-1">
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-margin-mobile"
        renderItem={({ item }) => <LogCard log={item} />}
        onEndReached={() => loadMore(searchTerm)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#005b52" className="my-4" /> : null}
      />
    </SafeAreaView>
  );
}
