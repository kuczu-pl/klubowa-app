// ═══════════════════════════════════════════════════════════════════
// REGISTER SCREEN — mirrors AuthScreen component register mode
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useTheme } from '../../src/utils/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { register } = useAuthStore();
  const { settings } = useSettingsStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Wypełnij wszystkie pola');
      return;
    }
    setLoading(true);
    setError('');
    const err = await register(
      { name: name.trim(), email: email.trim(), password },
      settings
    );
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.orgName, { color: theme.primary }]}>
            {settings.orgName || 'Aplikacja Koła'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textM || '#666' }]}>
            Utwórz nowe konto
          </Text>
        </View>

        <View style={[styles.card, theme.shadow]}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Imię i nazwisko</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border }]}
            value={name}
            onChangeText={setName}
            autoComplete="name"
            placeholder="Jan Kowalski"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="twoj@email.pl"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Hasło (min. 6 znaków)</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
            placeholder="••••••"
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Zarejestruj się</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => router.replace('/login')}
          >
            <Text style={[styles.linkText, { color: theme.primary }]}>
              Masz już konto? Zaloguj się
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  orgName: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  errorBox: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#c00', fontSize: 14, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkBtn: { alignItems: 'center', marginTop: 16, padding: 8 },
  linkText: { fontSize: 14 },
});
