// ═══════════════════════════════════════════════════════════════════
// IDEAS SERVICE — extracted from App.jsx lines 373-409
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Idea } from '../types';

export async function createIdea(
  data: Pick<Idea, 'title' | 'description'>,
  authorId: string
): Promise<{ id: string; item: Idea }> {
  const item: Omit<Idea, 'id'> = {
    title: data.title,
    description: data.description,
    authorId,
    date: new Date().toISOString().split('T')[0],
    votes: 0,
    voters: [],
    status: 'nowy',
  };
  const ref = await firestore().collection('ideas').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function updateIdea(
  id: string,
  data: Partial<Pick<Idea, 'title' | 'description'>>
): Promise<void> {
  await firestore().collection('ideas').doc(id).update(data);
}

export async function deleteIdea(id: string): Promise<void> {
  await firestore().collection('ideas').doc(id).delete();
}

export async function voteIdea(id: string, userId: string): Promise<void> {
  const ideaRef = firestore().collection('ideas').doc(id);
  await firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ideaRef);
    if (!snap.exists) throw new Error('not-found');
    const voters: string[] = snap.data()?.voters || [];
    const hasVoted = voters.includes(userId);
    if (hasVoted) {
      tx.update(ideaRef, {
        voters: firestore.FieldValue.arrayRemove(userId),
        votes: firestore.FieldValue.increment(-1),
      });
    } else {
      tx.update(ideaRef, {
        voters: firestore.FieldValue.arrayUnion(userId),
        votes: firestore.FieldValue.increment(1),
      });
    }
  });
}

export async function setIdeaStatus(id: string, status: string): Promise<void> {
  await firestore().collection('ideas').doc(id).update({ status });
}
