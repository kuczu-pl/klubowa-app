// ═══════════════════════════════════════════════════════════════════
// DUES SERVICE — extracted from App.jsx lines 762-962
// Handles: single dues, bulk dues, event-based dues, toggle paid
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Due, User, Event, Settings } from '../types';
import { mName, tplt, mailWrapper, DEFAULT_SETTINGS } from '../utils/helpers';

// ── ADD SINGLE DUE ──

export async function addDue(
  fd: {
    userId: string;
    amount?: number;
    title?: string;
    feeType?: string;
    month?: string;
    date?: string;
  },
  settings: Settings
): Promise<{ id: string; item: Due } | { error: string }> {
  const isMonthly = fd.feeType !== 'specific';
  const finalTitle = fd.title || 'Składka miesięczna';

  const mDate = fd.month || new Date().toISOString().substring(0, 7);
  const eDate = fd.date || new Date().toISOString().substring(0, 10);
  const monthKey = isMonthly ? mDate : eDate.substring(0, 7);
  const exactDate = isMonthly ? null : eDate;

  // Check for duplicate monthly dues
  if (finalTitle === 'Składka miesięczna') {
    const dupSnap = await firestore()
      .collection('dues')
      .where('userId', '==', fd.userId)
      .where('month', '==', monthKey)
      .get();
    const isDup = dupSnap.docs.some((d) => {
      const data = d.data();
      return !data.title || data.title === 'Składka miesięczna';
    });
    if (isDup) return { error: 'Ta składka już istnieje w tym miesiącu!' };
  }

  const item = {
    userId: fd.userId,
    month: monthKey,
    date: exactDate,
    amount: fd.amount || settings.dueAmount,
    title: finalTitle,
    paid: false,
    paidDate: null,
    createdAt: new Date().toISOString(),
  };
  const ref = await firestore().collection('dues').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } as Due };
}

// ── TOGGLE PAID STATUS ──

export async function toggleDuePaid(
  id: string,
  currentPaid: boolean
): Promise<{ paid: boolean; paidDate: string | null }> {
  const isPaid = !currentPaid;
  const paidDate = isPaid ? new Date().toISOString().split('T')[0] : null;
  await firestore().collection('dues').doc(id).update({ paid: isPaid, paidDate });
  return { paid: isPaid, paidDate };
}

// ── SEND DUE PAID EMAIL ──

export async function sendDuePaidEmail(
  due: Due,
  targetUser: User,
  settings: Settings
): Promise<void> {
  const bodyTpl = settings.duePaidBody || DEFAULT_SETTINGS.duePaidBody;
  const subjTpl = settings.duePaidSubject || DEFAULT_SETTINGS.duePaidSubject;
  await firestore().collection('mail_queue').add({
    to: [targetUser.email],
    message: {
      subject: tplt(subjTpl, { month: mName(due.month), orgName: settings.orgName }),
      html: mailWrapper(
        tplt(bodyTpl, {
          name: targetUser.name,
          month: mName(due.month),
          amount: due.amount,
          currency: settings.dueCurrency,
          date: due.paidDate || '',
          orgName: settings.orgName,
        })
      ),
    },
    authorId: 'system',
    createdAt: new Date().toISOString(),
    status: 'queued',
  });
}

// ── DELETE DUE ──

export async function deleteDue(id: string): Promise<void> {
  await firestore().collection('dues').doc(id).delete();
}

// ── BULK DUES (monthly/custom for all users) ──

export async function addBulkDues(
  fd: {
    title?: string;
    type: 'fixed' | 'shared';
    fixedAmount?: number;
    totalAmount?: number;
    target: 'all' | 'unpaid';
    feeType?: string;
    month?: string;
    date?: string;
  },
  users: User[],
  currentDues: Due[],
  settings: Settings
): Promise<{ newDues: Due[]; count: number } | { error: string }> {
  const isMonthly = fd.feeType !== 'specific';
  const finalTitle = fd.title || 'Składka miesięczna';

  const mDate = fd.month || new Date().toISOString().substring(0, 7);
  const eDate = fd.date || new Date().toISOString().substring(0, 10);
  const monthKey = isMonthly ? mDate : eDate.substring(0, 7);
  const exactDate = isMonthly ? null : eDate;

  let targetUsers: User[] = [];
  if (fd.target === 'unpaid') {
    const unpaidIds = [...new Set(currentDues.filter((d) => !d.paid).map((d) => d.userId))];
    targetUsers = users.filter((u) => unpaidIds.includes(u.id));
  } else {
    if (finalTitle === 'Składka miesięczna') {
      const existingSnap = await firestore()
        .collection('dues')
        .where('month', '==', monthKey)
        .get();
      const existingUserIds = new Set(
        existingSnap.docs
          .map((d) => d.data())
          .filter((d) => !d.title || d.title === 'Składka miesięczna')
          .map((d) => d.userId)
      );
      targetUsers = users.filter((u) => !existingUserIds.has(u.id));
    } else {
      targetUsers = users;
    }
  }

  if (targetUsers.length === 0) {
    return { error: 'Brak osób do obciążenia (lub mają już opłacone)' };
  }

  const amountPerPerson =
    fd.type === 'shared'
      ? parseFloat((fd.totalAmount! / targetUsers.length).toFixed(2))
      : fd.fixedAmount || settings.dueAmount;

  const batch = firestore().batch();
  const newItems: Due[] = [];
  const now = new Date().toISOString();

  for (const u of targetUsers) {
    const newRef = firestore().collection('dues').doc();
    const item = {
      userId: u.id,
      month: monthKey,
      date: exactDate,
      amount: amountPerPerson,
      title: finalTitle,
      paid: false,
      paidDate: null,
      createdAt: now,
    };
    batch.set(newRef, item);
    newItems.push({ id: newRef.id, ...item } as Due);
  }

  await batch.commit();

  // Send notification emails
  const bodyTpl = settings.dueCreatedBody || DEFAULT_SETTINGS.dueCreatedBody;
  const subjTpl = settings.dueCreatedSubject || DEFAULT_SETTINGS.dueCreatedSubject;

  for (const u of targetUsers) {
    if (u.email) {
      const monthLabel =
        finalTitle === 'Składka miesięczna'
          ? mName(monthKey)
          : `${finalTitle} (${exactDate || mName(monthKey)})`;
      await firestore().collection('mail_queue').add({
        to: [u.email],
        message: {
          subject: tplt(subjTpl, { month: mName(monthKey), orgName: settings.orgName }),
          html: mailWrapper(
            tplt(bodyTpl, {
              name: u.name,
              month: monthLabel,
              amount: amountPerPerson,
              currency: settings.dueCurrency,
              orgName: settings.orgName,
            })
          ),
        },
        authorId: 'system',
        createdAt: now,
        status: 'queued',
      });
    }
  }

  return { newDues: newItems, count: newItems.length };
}

// ── EVENT-BASED DUES ──

export async function addEventDues(
  fd: {
    eventId: string;
    type: 'fixed' | 'shared';
    totalAmount?: number;
    fixedAmount?: number;
    target: 'attendees' | 'all';
  },
  event: Event,
  users: User[],
  authorId: string,
  settings: Settings
): Promise<{ newDues: Due[]; financeItem?: any } | { error: string }> {
  let targetUsers: User[] = [];
  if (fd.target === 'attendees') {
    targetUsers = users.filter((u) => event.attendees?.includes(u.id));
  } else {
    targetUsers = users;
  }

  if (targetUsers.length === 0) return { error: 'Brak osób do obciążenia!' };

  const amountPerPerson =
    fd.type === 'shared'
      ? parseFloat((fd.totalAmount! / targetUsers.length).toFixed(2))
      : fd.fixedAmount!;

  const batch = firestore().batch();
  const now = new Date().toISOString();

  // Add expense to finances if applicable
  const financeCost = fd.type === 'shared' ? fd.totalAmount! : event.cost || 0;
  let financeItem;
  if (financeCost > 0) {
    const finRef = firestore().collection('finances').doc();
    financeItem = {
      id: finRef.id,
      type: 'expense',
      title: `Koszt: ${event.title}`,
      amount: financeCost,
      category: 'wynajem',
      date: event.date,
      authorId,
      eventId: fd.eventId,
    };
    batch.set(finRef, financeItem);
  }

  const newDues: Due[] = [];
  targetUsers.forEach((u) => {
    const newRef = firestore().collection('dues').doc();
    const item = {
      userId: u.id,
      month: event.date.substring(0, 7),
      date: event.date,
      amount: amountPerPerson,
      paid: false,
      paidDate: null,
      eventId: fd.eventId,
      title: event.title,
      createdAt: now,
    };
    batch.set(newRef, item);
    newDues.push({ id: newRef.id, ...item } as Due);
  });

  await batch.commit();
  return { newDues, financeItem };
}
