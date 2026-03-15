// ═══════════════════════════════════════════════════════════════════
// RECIPES SERVICE — extracted from App.jsx lines 411-445
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import type { Recipe } from '../types';

export async function createRecipe(
  data: Pick<Recipe, 'title' | 'category' | 'ingredients' | 'instructions'>,
  authorId: string
): Promise<{ id: string; item: Recipe }> {
  const item: Omit<Recipe, 'id'> = {
    title: data.title,
    category: data.category,
    ingredients: data.ingredients,
    instructions: data.instructions,
    authorId,
    date: new Date().toISOString().split('T')[0],
    likes: 0,
    likers: [],
  };
  const ref = await firestore().collection('recipes').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function updateRecipe(
  id: string,
  data: Partial<Pick<Recipe, 'title' | 'category' | 'ingredients' | 'instructions'>>
): Promise<void> {
  await firestore().collection('recipes').doc(id).update(data);
}

export async function deleteRecipe(id: string): Promise<void> {
  await firestore().collection('recipes').doc(id).delete();
}

export async function likeRecipe(id: string, userId: string): Promise<void> {
  const recipeRef = firestore().collection('recipes').doc(id);
  await firestore().runTransaction(async (tx) => {
    const snap = await tx.get(recipeRef);
    if (!snap.exists) throw new Error('not-found');
    const likers: string[] = snap.data()?.likers || [];
    const hasLiked = likers.includes(userId);
    if (hasLiked) {
      tx.update(recipeRef, {
        likers: firestore.FieldValue.arrayRemove(userId),
        likes: firestore.FieldValue.increment(-1),
      });
    } else {
      tx.update(recipeRef, {
        likers: firestore.FieldValue.arrayUnion(userId),
        likes: firestore.FieldValue.increment(1),
      });
    }
  });
}
