// Root index — Expo Router entry point
// Auth guard in _layout.tsx handles redirect to (auth) or (app)
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/useAuthStore';

export default function RootIndex() {
  const { user, booted } = useAuthStore();

  if (!booted) return null;

  if (user) {
    return <Redirect href="/(app)/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
