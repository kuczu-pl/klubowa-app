// ═══════════════════════════════════════════════════════════════════
// COMMENTS SERVICE — extracted from App.jsx lines 1046-1061
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Comment } from '../types';

export async function addComment(
  type: string,
  contentId: string,
  text: string,
  authorId: string
): Promise<{ id: string; item: Comment }> {
  const item = {
    type,
    contentId,
    authorId,
    text,
    date: new Date().toISOString(),
  };
  const ref = await firestore().collection('comments').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function deleteComment(id: string): Promise<void> {
  await firestore().collection('comments').doc(id).delete();
}
