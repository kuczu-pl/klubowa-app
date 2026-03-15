// Placeholder — full implementation in Phase 3
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../src/utils/theme';

export default function MessagesTab() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.text, { color: theme.text }]}>Wiadomości — Phase 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});
