// ═══════════════════════════════════════════════════════════════════
// FINANCES SERVICE — extracted from App.jsx lines 1063-1069
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Finance } from '../types';

export async function addFinance(
  data: Pick<Finance, 'type' | 'title' | 'amount' | 'category'> & { date?: string },
  authorId: string
): Promise<{ id: string; item: Finance }> {
  const item = {
    type: data.type,
    title: data.title,
    amount: data.amount || 0,
    category: data.category,
    date: data.date || new Date().toISOString().split('T')[0],
    authorId,
  };
  const ref = await firestore().collection('finances').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function deleteFinance(id: string): Promise<void> {
  await firestore().collection('finances').doc(id).delete();
}
