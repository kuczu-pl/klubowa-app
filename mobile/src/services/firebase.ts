// ═══════════════════════════════════════════════════════════════════
// FIREBASE — React Native Firebase (native modules)
// Config is handled by google-services.json (Android)
// ═══════════════════════════════════════════════════════════════════

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';

// Enable Firestore offline persistence
firestore().settings({
  persistence: true,
});

export { firebase, auth, firestore, storage, messaging };

// Helper to get typed collection reference
export const getCollection = (name: string) => firestore().collection(name);
export const getDoc = (collection: string, id: string) => firestore().collection(collection).doc(id);
