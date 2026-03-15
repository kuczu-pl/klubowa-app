// ═══════════════════════════════════════════════════════════════════
// MESSAGES SERVICE — extracted from App.jsx lines 1182-1236
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Message, Settings } from '../types';

export async function sendMessage(
  fromUserId: string,
  toUserId: string,
  text: string,
  senderName: string,
  targetUser: { email?: string; name: string; lastMailSent?: string } | undefined,
  settings: Settings
): Promise<{ id: string; item: Message }> {
  const m = {
    from: fromUserId,
    to: toUserId,
    text: text.trim(),
    date: new Date().toISOString(),
    read: false,
  };
  const ref = await firestore().collection('messages').add(m);

  // Smart email notification (4-hour cooldown)
  if (targetUser?.email && toUserId !== 'group_general') {
    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000;
    const lastSent = targetUser.lastMailSent ? new Date(targetUser.lastMailSent).getTime() : 0;

    if (now - lastSent > fourHours) {
      await firestore().collection('mail_queue').add({
        to: [targetUser.email],
        message: {
          subject: `Nowa wiadomość w aplikacji od: ${senderName}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <p>Cześć ${targetUser.name}, masz nowe wiadomości na czacie w aplikacji ${settings.orgName}.</p>
              <p><strong>${senderName} napisał/a:</strong> "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"</p>
              <p>Zaloguj się, aby odpowiedzieć.</p>
            </div>
          `,
        },
        authorId: 'system',
        createdAt: new Date().toISOString(),
        status: 'queued',
      });

      await firestore().collection('users').doc(toUserId).update({
        lastMailSent: new Date().toISOString(),
      });
    }
  }

  return { id: ref.id, item: { id: ref.id, ...m } };
}

export async function markMessagesRead(
  partnerId: string,
  currentUserId: string,
  messages: Message[]
): Promise<string[]> {
  const unread = messages.filter(
    (m) => m.from === partnerId && m.to === currentUserId && !m.read
  );
  if (unread.length === 0) return [];

  for (const m of unread) {
    await firestore().collection('messages').doc(m.id).update({ read: true });
  }

  return unread.map((m) => m.id);
}

export async function fetchUserMessages(
  userId: string
): Promise<Message[]> {
  const msgsCol = firestore().collection('messages');
  const [sentSnap, recvSnap] = await Promise.all([
    msgsCol.where('from', '==', userId).get(),
    msgsCol.where('to', '==', userId).get(),
  ]);
  const msgMap = new Map<string, Message>();
  [...sentSnap.docs, ...recvSnap.docs].forEach((d) =>
    msgMap.set(d.id, { id: d.id, ...d.data() } as Message)
  );
  return [...msgMap.values()];
}
