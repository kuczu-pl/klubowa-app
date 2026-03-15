// ═══════════════════════════════════════════════════════════════════
// AUTH SERVICE — extracted from App.jsx lines 289-348
// ═══════════════════════════════════════════════════════════════════

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { User } from '../types';
import { tplt, mailWrapper, DEFAULT_SETTINGS } from '../utils/helpers';
import type { Settings } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user. First user becomes admin.
 * Mirrors App.jsx doRegister() lines 289-329.
 */
export async function doRegister(
  data: RegisterData,
  settings: Settings
): Promise<{ user: User; isFirst: boolean } | { error: string }> {
  try {
    const cred = await auth().createUserWithEmailAndPassword(data.email, data.password);
    const usersSnap = await firestore().collection('users').get();
    const isFirst = usersSnap.empty;

    const newUser: User = {
      id: cred.user.uid,
      name: data.name,
      email: data.email,
      role: isFirst ? 'admin' : 'member',
      phone: '',
      joined: new Date().toISOString().split('T')[0],
      onboarded: false,
      rating: 3,
    };

    await firestore().collection('users').doc(cred.user.uid).set(newUser);

    // Queue welcome email
    const bodyTpl = settings.welcomeBody || DEFAULT_SETTINGS.welcomeBody;
    const subjTpl = settings.welcomeSubject || DEFAULT_SETTINGS.welcomeSubject;
    await firestore().collection('mail_queue').add({
      to: [data.email],
      message: {
        subject: tplt(subjTpl, { name: data.name, orgName: settings.orgName }),
        html: mailWrapper(tplt(bodyTpl, { name: data.name, orgName: settings.orgName })),
      },
      authorId: 'system',
      createdAt: new Date().toISOString(),
      status: 'queued',
    });

    return { user: newUser, isFirst };
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') return { error: 'Ten e-mail jest już zarejestrowany' };
    if (err.code === 'auth/weak-password') return { error: 'Hasło musi mieć min. 6 znaków' };
    return { error: 'Błąd rejestracji: ' + err.message };
  }
}

/**
 * Login with email/password.
 * Mirrors App.jsx doLogin() lines 330-337.
 */
export async function doLogin(data: LoginData): Promise<{ uid: string } | { error: string }> {
  try {
    const cred = await auth().signInWithEmailAndPassword(data.email, data.password);
    return { uid: cred.user.uid };
  } catch {
    return { error: 'Nieprawidłowy e-mail lub hasło' };
  }
}

/**
 * Logout.
 */
export async function doLogout(): Promise<void> {
  await auth().signOut();
}

/**
 * Change password with reauthentication.
 * Mirrors App.jsx handlePwSave() lines 1721-1737.
 */
export async function changePassword(oldPw: string, newPw: string): Promise<string | null> {
  if (newPw.length < 6) return 'Nowe hasło: minimum 6 znaków!';
  try {
    const currentUser = auth().currentUser;
    if (!currentUser || !currentUser.email) return 'Brak zalogowanego użytkownika';
    const cred = auth.EmailAuthProvider.credential(currentUser.email, oldPw);
    await currentUser.reauthenticateWithCredential(cred);
    await currentUser.updatePassword(newPw);
    return null;
  } catch (err: any) {
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      return 'Nieprawidłowe obecne hasło';
    }
    return 'Błąd: ' + err.message;
  }
}
