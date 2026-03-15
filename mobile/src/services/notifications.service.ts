// ═══════════════════════════════════════════════════════════════════
// NOTIFICATIONS SERVICE — extracted from App.jsx lines 274-286
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Notification } from '../types';

export async function addNotification(
  userId: string,
  type: string,
  msg: string
): Promise<{ id: string; item: Notification }> {
  const item = {
    userId,
    type,
    msg,
    date: new Date().toISOString(),
    read: false,
  };
  const ref = await firestore().collection('notifications').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function markAllNotifsRead(
  userId: string,
  notifs: Notification[]
): Promise<string[]> {
  const unread = notifs.filter((n) => n.userId === userId && !n.read);
  for (const n of unread) {
    await firestore().collection('notifications').doc(n.id).update({ read: true });
  }
  return unread.map((n) => n.id);
}

export async function fetchUserNotifications(
  userId: string
): Promise<Notification[]> {
  const snap = await firestore()
    .collection('notifications')
    .where('userId', '==', userId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}
