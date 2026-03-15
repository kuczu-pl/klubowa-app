// ═══════════════════════════════════════════════════════════════════
// SETTINGS SERVICE — extracted from App.jsx lines 1104-1132
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import type { Settings } from '../types';

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  await firestore().collection('settings').doc('main').set(settings, { merge: true });
}

export async function fetchSettings(): Promise<Settings | null> {
  const doc = await firestore().collection('settings').doc('main').get();
  return doc.exists ? (doc.data() as Settings) : null;
}

export async function handleSetupComplete(
  currentSettings: Settings,
  wizardSettings: Partial<Settings>
): Promise<Settings> {
  const finalData = { ...currentSettings, ...wizardSettings, setupCompleted: true };
  await firestore().collection('settings').doc('main').set(finalData, { merge: true });
  return finalData as Settings;
}

export async function uploadLogo(file: { uri: string; size: number }): Promise<string> {
  if (file.size > 2 * 1024 * 1024) throw new Error('Max 2 MB!');
  const storageRef = storage().ref('org/logo.png');
  await storageRef.putFile(file.uri);
  const url = await storageRef.getDownloadURL();
  await saveSettings({ orgLogoUrl: url } as Partial<Settings>);
  return url;
}
