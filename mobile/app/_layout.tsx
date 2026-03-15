// ═══════════════════════════════════════════════════════════════════
// ROOT LAYOUT — AuthGuard + Providers
// Mirrors App.jsx: if(!booted) → splash, if(!user) → auth screens
// ═══════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';
import { useDataStore } from '../src/stores/useDataStore';
import { ThemeContext, resolveTheme } from '../src/utils/theme';

export default function RootLayout() {
  const { booted, user, init } = useAuthStore();
  const { settings, load: loadSettings } = useSettingsStore();
  const { loadAllData, loadPublicData } = useDataStore();

  // Initialize auth listener on mount
  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  // Load settings when auth boots
  useEffect(() => {
    if (booted) {
      loadSettings();
    }
  }, [booted]);

  // Load data when user changes
  useEffect(() => {
    if (booted && user) {
      loadAllData(user.id, user.role);
    } else if (booted && !user) {
      loadPublicData();
    }
  }, [booted, user?.id]);

  // Resolve theme
  const theme = resolveTheme(user?.theme, settings);

  if (!booted) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4a90d9" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContext.Provider value={theme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          ) : (
            <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
          )}
        </Stack>
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f8fb',
  },
});
