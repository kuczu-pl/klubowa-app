// ═══════════════════════════════════════════════════════════════════
// DOCUMENTS SERVICE — extracted from App.jsx lines 1304-1326
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import type { Document } from '../types';

export interface DocumentUpload {
  uri: string;
  name: string;
  size: number;
}

export async function addDocument(
  file: DocumentUpload,
  data: { title?: string; description?: string; folder?: string },
  authorId: string
): Promise<{ id: string; item: Document }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
  const path = `documents/${authorId}_${Date.now()}.${ext}`;
  const storageRef = storage().ref(path);

  await storageRef.putFile(file.uri);
  const url = await storageRef.getDownloadURL();

  const item = {
    title: data.title || file.name,
    description: data.description || '',
    url,
    fileName: file.name,
    fileSize: file.size,
    category: data.folder || 'Inne',
    folder: data.folder || 'Inne',
    storagePath: path,
    authorId,
    date: new Date().toISOString().split('T')[0],
  };
  const ref = await firestore().collection('documents').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function deleteDocument(doc: Document): Promise<void> {
  try {
    if (doc.storagePath) {
      await storage().ref(doc.storagePath).delete();
    }
  } catch {
    // Storage file may already be deleted
  }
  await firestore().collection('documents').doc(doc.id).delete();
}
