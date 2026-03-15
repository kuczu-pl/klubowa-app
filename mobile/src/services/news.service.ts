// ═══════════════════════════════════════════════════════════════════
// NEWS SERVICE — extracted from App.jsx lines 353-371
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { NewsItem } from '../types';

export async function createNews(
  data: Omit<NewsItem, 'id' | 'date' | 'pinned'>
): Promise<string> {
  const item = {
    ...data,
    date: new Date().toISOString().split('T')[0],
    pinned: false,
  };
  const ref = await firestore().collection('news').add(item);
  return ref.id;
}

export async function updateNews(
  id: string,
  data: Partial<Pick<NewsItem, 'title' | 'content' | 'category'>>
): Promise<void> {
  await firestore().collection('news').doc(id).update(data);
}

export async function deleteNews(id: string): Promise<void> {
  await firestore().collection('news').doc(id).delete();
}

export async function togglePin(id: string, currentPinned: boolean): Promise<void> {
  await firestore().collection('news').doc(id).update({ pinned: !currentPinned });
}
