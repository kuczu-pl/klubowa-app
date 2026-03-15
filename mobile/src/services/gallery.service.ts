// ═══════════════════════════════════════════════════════════════════
// GALLERY SERVICE — extracted from App.jsx lines 963-1045
// Handles: image upload, album management, deletion
// ═══════════════════════════════════════════════════════════════════

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import type { GalleryItem, Album } from '../types';

export interface UploadItem {
  uri: string;
  name: string;
}

export async function uploadGalleryItems(
  files: UploadItem[],
  title: string | undefined,
  albumId: string | null,
  authorId: string
): Promise<GalleryItem[]> {
  const newItems: GalleryItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = `gallery/${Date.now()}_${i}_${file.name}`;
    const storageRef = storage().ref(filePath);

    await storageRef.putFile(file.uri);
    const downloadUrl = await storageRef.getDownloadURL();

    let finalTitle = file.name;
    if (title) {
      finalTitle = files.length > 1 ? `${title} ${i + 1}` : title;
    }

    const item = {
      title: finalTitle,
      imageData: downloadUrl,
      storagePath: filePath,
      authorId,
      date: new Date().toISOString().split('T')[0],
      albumId: albumId || null,
    };

    const docRef = await firestore().collection('gallery').add(item);
    newItems.push({ id: docRef.id, ...item });
  }

  return newItems;
}

export async function deleteGalleryItem(item: GalleryItem): Promise<void> {
  try {
    if (item.storagePath) {
      await storage().ref(item.storagePath).delete();
    }
  } catch {
    // Storage file may already be deleted
  }
  await firestore().collection('gallery').doc(item.id).delete();
}

// ── ALBUMS ──

export async function createAlbum(
  data: Pick<Album, 'name' | 'description'>,
  authorId: string
): Promise<{ id: string; item: Album }> {
  const item = {
    name: data.name,
    description: data.description || '',
    authorId,
    date: new Date().toISOString().split('T')[0],
  };
  const ref = await firestore().collection('albums').add(item);
  return { id: ref.id, item: { id: ref.id, ...item } };
}

export async function deleteAlbum(id: string): Promise<void> {
  await firestore().collection('albums').doc(id).delete();
}
