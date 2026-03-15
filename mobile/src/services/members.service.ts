// ═══════════════════════════════════════════════════════════════════
// MEMBERS SERVICE — extracted from App.jsx lines 446-458, 1071-1102
// Role management, player ratings, user removal
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { UserRole } from '../types';

export async function changeRole(uid: string, newRole: UserRole): Promise<void> {
  await firestore().collection('users').doc(uid).update({ role: newRole });
}

export async function updatePlayerRating(uid: string, rating: number): Promise<void> {
  await firestore().collection('users').doc(uid).update({ rating });
}

export async function updateUserProfile(
  uid: string,
  data: { name?: string; phone?: string; theme?: string }
): Promise<void> {
  await firestore().collection('users').doc(uid).update(data);
}

export async function finishOnboarding(uid: string): Promise<void> {
  await firestore().collection('users').doc(uid).update({ onboarded: true });
}

export async function removeUser(uid: string): Promise<void> {
  const batch = firestore().batch();

  // 1. Delete user document
  batch.delete(firestore().collection('users').doc(uid));

  // 2. Delete user's dues
  const duesSnap = await firestore()
    .collection('dues')
    .where('userId', '==', uid)
    .get();
  duesSnap.docs.forEach((d) => batch.delete(d.ref));

  // 3. Delete user's notifications
  const notifsSnap = await firestore()
    .collection('notifications')
    .where('userId', '==', uid)
    .get();
  notifsSnap.docs.forEach((n) => batch.delete(n.ref));

  await batch.commit();
}

export async function quickThemeChange(uid: string, themeKey: string): Promise<void> {
  await firestore().collection('users').doc(uid).update({ theme: themeKey });
}
