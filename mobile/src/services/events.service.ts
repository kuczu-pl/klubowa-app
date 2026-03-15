// ═══════════════════════════════════════════════════════════════════
// EVENTS SERVICE — extracted from App.jsx lines 487-761
// Most complex service: RSVP, equipment, payments, messenger import,
// team balancing, tactics
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Event, User } from '../types';
import { balanceTeams, canManage } from '../utils/helpers';

// ── CRUD ──

export async function createEvent(
  data: Pick<Event, 'title' | 'date' | 'time' | 'place' | 'description'> & { limit?: string; cost?: string }
): Promise<{ id: string; item: Event }> {
  const limit = data.limit ? parseInt(data.limit) : 0;
  const cost = data.cost ? parseFloat(data.cost) : 0;
  const item = {
    title: data.title,
    date: data.date,
    time: data.time,
    place: data.place,
    description: data.description,
    limit,
    cost,
    attendees: [] as string[],
    reserve: [] as string[],
    pendingCancellations: [] as string[],
  };
  const ref = await firestore().collection('events').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } as Event };
}

export async function updateEvent(
  id: string,
  data: Partial<Pick<Event, 'title' | 'date' | 'time' | 'place' | 'description' | 'limit'>>
): Promise<void> {
  await firestore().collection('events').doc(id).update(data);
}

export async function deleteEvent(id: string): Promise<void> {
  await firestore().collection('events').doc(id).delete();
}

// ── RSVP SYSTEM (36-hour lock rule) ──

export type RSVPResult = {
  action: 'joined' | 'left' | 'reserve_joined' | 'reserve_left' | 'pending' | 'already_pending' | 'promoted';
  newAttendees: string[];
  newReserve: string[];
  newPending: string[];
};

export async function toggleRSVP(
  eventId: string,
  event: Event,
  userId: string
): Promise<RSVPResult> {
  const isGoing = event.attendees?.includes(userId);
  const isPending = event.pendingCancellations?.includes(userId);
  const isReserve = event.reserve?.includes(userId);
  const limit = event.limit || 0;
  const isFull = limit > 0 && (event.attendees?.length || 0) >= limit;

  const eventRef = firestore().collection('events').doc(eventId);

  // Already on reserve — just leave
  if (isReserve) {
    await eventRef.update({ reserve: firestore.FieldValue.arrayRemove(userId) });
    return {
      action: 'reserve_left',
      newAttendees: event.attendees,
      newReserve: event.reserve.filter((id) => id !== userId),
      newPending: event.pendingCancellations || [],
    };
  }

  if (isGoing) {
    if (isPending) {
      return {
        action: 'already_pending',
        newAttendees: event.attendees,
        newReserve: event.reserve || [],
        newPending: event.pendingCancellations || [],
      };
    }

    // 36-hour rule
    const matchDate = new Date(`${event.date}T${event.time || '00:00'}`);
    const now = new Date();
    const diffHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 36) {
      await eventRef.update({
        pendingCancellations: firestore.FieldValue.arrayUnion(userId),
      });
      return {
        action: 'pending',
        newAttendees: event.attendees,
        newReserve: event.reserve || [],
        newPending: [...(event.pendingCancellations || []), userId],
      };
    } else {
      // Free cancellation + auto-promote from reserve
      let newAttendees = event.attendees.filter((id) => id !== userId);
      let newReserve = [...(event.reserve || [])];

      if (limit > 0 && newAttendees.length < limit && newReserve.length > 0) {
        const promoted = newReserve.shift()!;
        newAttendees.push(promoted);
      }

      await eventRef.update({ attendees: newAttendees, reserve: newReserve });
      return {
        action: 'left',
        newAttendees,
        newReserve,
        newPending: event.pendingCancellations || [],
      };
    }
  } else {
    // Joining
    if (isFull) {
      await eventRef.update({ reserve: firestore.FieldValue.arrayUnion(userId) });
      return {
        action: 'reserve_joined',
        newAttendees: event.attendees,
        newReserve: [...(event.reserve || []), userId],
        newPending: event.pendingCancellations || [],
      };
    } else {
      await eventRef.update({ attendees: firestore.FieldValue.arrayUnion(userId) });
      return {
        action: 'joined',
        newAttendees: [...(event.attendees || []), userId],
        newReserve: event.reserve || [],
        newPending: event.pendingCancellations || [],
      };
    }
  }
}

// ── CANCELLATION RESOLUTION (admin) ──

export async function resolveCancellation(
  eventId: string,
  event: Event,
  targetUid: string,
  approved: boolean
): Promise<{ newAttendees: string[]; newReserve: string[]; newPending: string[] }> {
  const eventRef = firestore().collection('events').doc(eventId);

  if (approved) {
    let newAttendees = event.attendees.filter((id) => id !== targetUid);
    let newReserve = [...(event.reserve || [])];
    let newPending = (event.pendingCancellations || []).filter((id) => id !== targetUid);
    const limit = event.limit || 0;

    if (limit > 0 && newAttendees.length < limit && newReserve.length > 0) {
      const promoted = newReserve.shift()!;
      newAttendees.push(promoted);
    }

    await eventRef.update({
      attendees: newAttendees,
      pendingCancellations: newPending,
      reserve: newReserve,
    });
    return { newAttendees, newReserve, newPending };
  } else {
    await eventRef.update({
      pendingCancellations: firestore.FieldValue.arrayRemove(targetUid),
    });
    return {
      newAttendees: event.attendees,
      newReserve: event.reserve || [],
      newPending: (event.pendingCancellations || []).filter((id) => id !== targetUid),
    };
  }
}

// ── EQUIPMENT TOGGLE ──

export async function toggleEquipment(
  eventId: string,
  event: Event,
  type: string,
  userId: string,
  userRole: string
): Promise<Record<string, string | null>> {
  const currentEq = event.equipment || {};
  const currentProvider = currentEq[type];

  let newProvider: string | null = null;
  if (!currentProvider) {
    newProvider = userId;
  } else if (currentProvider === userId) {
    newProvider = null;
  } else if (canManage(userRole)) {
    newProvider = null;
  } else {
    return currentEq;
  }

  const newEq = { ...currentEq, [type]: newProvider };
  await firestore().collection('events').doc(eventId).update({ equipment: newEq });
  return newEq;
}

// ── EVENT PAYMENT TOGGLE ──

export async function toggleEventPayment(
  eventId: string,
  event: Event,
  targetUid: string
): Promise<string[]> {
  const currentPaid = event.paid || [];
  const isPaid = currentPaid.includes(targetUid);
  const newPaid = isPaid
    ? currentPaid.filter((id) => id !== targetUid)
    : [...currentPaid, targetUid];

  await firestore().collection('events').doc(eventId).update({ paid: newPaid });
  return newPaid;
}

// ── MESSENGER IMPORT (AI Scanner) ──

export function parseMessengerList(
  text: string,
  users: User[]
): { foundIds: string[]; guestIds: string[] } {
  const lines = text.split(/\r?\n/);
  const foundIds: string[] = [];
  const guestIds: string[] = [];

  lines.forEach((line) => {
    let trimmed = line.trim();
    if (!/^\d+\./.test(trimmed)) return;

    let cleanName = trimmed.replace(/^\d+\.\s*/, '').trim();
    cleanName = cleanName.replace(/\bGK\b/gi, '').replace(/[()]/g, '').trim();
    cleanName = cleanName.split('+')[0].trim();

    if (cleanName.length < 2 || /^_+$/.test(cleanName)) return;

    const cleanLower = cleanName.toLowerCase();
    const match = users.find((u) => {
      const dbLower = u.name.toLowerCase();
      if (cleanLower.includes(dbLower) || dbLower.includes(cleanLower)) return true;
      const messengerWords = cleanLower.split(' ').filter((w) => w.length > 2);
      const dbWords = dbLower.split(' ').filter((w) => w.length > 2);
      return messengerWords.some((mw) => dbWords.includes(mw));
    });

    if (match) {
      foundIds.push(match.id);
    } else {
      const guestId = 'guest_' + cleanName;
      if (!guestIds.includes(guestId)) guestIds.push(guestId);
    }
  });

  return {
    foundIds: [...new Set(foundIds)],
    guestIds: [...new Set(guestIds)],
  };
}

export async function importMessengerList(
  eventId: string,
  currentAttendees: string[],
  scannedIds: string[],
  mode: 'overwrite' | 'merge'
): Promise<string[]> {
  const finalAttendees =
    mode === 'overwrite' ? scannedIds : [...new Set([...currentAttendees, ...scannedIds])];

  await firestore().collection('events').doc(eventId).update({ attendees: finalAttendees });
  return finalAttendees;
}

// ── TEAM BALANCING ──

export async function saveMatchTeams(
  eventId: string,
  teams: { teamA: string[]; teamB: string[] }
): Promise<void> {
  await firestore().collection('events').doc(eventId).update({ teams });
}

export async function handleBalanceWithRatings(
  eventId: string,
  attendees: string[],
  users: User[],
  ratings: Record<string, string>
): Promise<{ teamA: string[]; teamB: string[] }> {
  const result = balanceTeams(attendees, users, ratings);
  await saveMatchTeams(eventId, result);
  return result;
}

// ── TACTICS ──

export async function updateEventTactics(
  eventId: string,
  positions: Record<string, { x: number; y: number }>
): Promise<void> {
  await firestore().collection('events').doc(eventId).update({ tactics: positions });
}
