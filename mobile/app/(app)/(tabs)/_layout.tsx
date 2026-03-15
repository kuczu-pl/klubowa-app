// ═══════════════════════════════════════════════════════════════════
// BOTTOM TABS LAYOUT — Dashboard, Events, Messages, Profile
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/utils/theme';
import { useSettingsStore } from '../../../src/stores/useSettingsStore';
import { useDataStore } from '../../../src/stores/useDataStore';
import { useAuthStore } from '../../../src/stores/useAuthStore';

export default function TabsLayout() {
  const theme = useTheme();
  const { settings } = useSettingsStore();
  const { messages, users } = useDataStore();
  const { user } = useAuthStore();

  const msgBadge = user
    ? messages.filter(
        (m) => m.to === user.id && m.from !== user.id && !m.read && users.some((u) => u.id === m.from)
      ).length
    : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textM || '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: settings.labelDashboard || 'Główna',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: settings.labelEvents || 'Kalendarz',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: settings.labelMessages || 'Czat',
          tabBarBadge: msgBadge > 0 ? msgBadge : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
