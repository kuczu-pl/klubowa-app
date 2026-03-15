import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TacticsBoardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tablica Taktyczna — Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f8fb' },
  text: { fontSize: 18, color: '#333' },
});
