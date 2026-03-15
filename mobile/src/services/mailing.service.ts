// ═══════════════════════════════════════════════════════════════════
// MAILING SERVICE — extracted from App.jsx lines 1238-1302
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { User, Due, Settings } from '../types';
import { canManage, tplt, mailWrapper } from '../utils/helpers';

export async function queueMassMail(
  fd: {
    subject: string;
    htmlBody: string;
    audience: 'all' | 'unpaid' | 'zarzad' | 'custom';
    customUsers?: string[];
    attachments?: any[];
  },
  users: User[],
  dues: Due[],
  settings: Settings,
  authorId: string
): Promise<{ count: number } | { error: string }> {
  let targetUsers: User[] = [];

  if (fd.audience === 'all') {
    targetUsers = users;
  } else if (fd.audience === 'unpaid') {
    const unpaidUserIds = [...new Set(dues.filter((d) => !d.paid).map((d) => d.userId))];
    targetUsers = users.filter((u) => unpaidUserIds.includes(u.id));
  } else if (fd.audience === 'zarzad') {
    targetUsers = users.filter((u) => canManage(u.role));
  } else if (fd.audience === 'custom') {
    targetUsers = users.filter((u) => fd.customUsers?.includes(u.id));
  }

  // Deduplicate by email
  const uniqueUsers: User[] = [];
  const seenEmails = new Set<string>();
  for (const u of targetUsers) {
    if (u.email && !seenEmails.has(u.email)) {
      seenEmails.add(u.email);
      uniqueUsers.push(u);
    }
  }

  if (uniqueUsers.length === 0) {
    return { error: 'Błąd: Wybrana grupa nie ma adresów e-mail.' };
  }

  const batch = firestore().batch();

  for (const u of uniqueUsers) {
    const mailRef = firestore().collection('mail_queue').doc();
    const personalizedSubject = tplt(fd.subject, { name: u.name, orgName: settings.orgName });
    const personalizedHtml = mailWrapper(
      tplt(fd.htmlBody, { name: u.name, orgName: settings.orgName })
    );

    const mailDoc: any = {
      to: [u.email],
      message: {
        subject: personalizedSubject,
        html: personalizedHtml,
      },
      authorId,
      createdAt: new Date().toISOString(),
      audience: fd.audience,
      status: 'queued',
    };

    if (fd.attachments && fd.attachments.length > 0) {
      mailDoc.message.attachments = fd.attachments;
    }

    batch.set(mailRef, mailDoc);
  }

  await batch.commit();
  return { count: uniqueUsers.length };
}
