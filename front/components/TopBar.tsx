import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TopBarProps {
  title: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onBack?: () => void;
}

export function TopBar({ title, onBack, leftSlot, rightSlot }: TopBarProps) {
  return (
    <View className="bg-surface-container-lowest border-b border-surface-container-highest flex-row items-center justify-between px-4 h-14">
      <View className="w-12 items-start">
        {leftSlot || (onBack && (
          <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center -ml-2">
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-primary font-semibold text-base tracking-tight flex-1 text-center" numberOfLines={1}>
        {title}
      </Text>
      <View className="w-12 items-end">
        {rightSlot}
      </View>
    </View>
  );
}
