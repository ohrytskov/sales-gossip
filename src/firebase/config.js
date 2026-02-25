import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database'
import { getApps, getApp } from 'firebase/app';

const firebaseApiKeyB64 = [
  'QUl6YVN5QmRmc0c5NlR2azBJXzJB',
  'ODE3eFFzd3o0SUY5Qm5FS3Bv',
].join('')

function decodeBase64(b64) {
  if (!b64) return ''
  try {
    if (typeof atob === 'function') return atob(b64)
  } catch (_) {}
  try {
    const Buf = typeof globalThis !== 'undefined' ? globalThis['Buffer'] : undefined
    if (Buf && typeof Buf.from === 'function') return Buf.from(b64, 'base64').toString('utf8')
  } catch (_) {}
  return ''
}

const firebaseConfig = {
  apiKey: decodeBase64(firebaseApiKeyB64),
  authDomain: 'auth.corpgossip.com',
  databaseURL: 'https://sales-gossip.firebaseio.com/',
  projectId: 'coldcall-48def',
  storageBucket: 'coldcall-48def.appspot.com',
  messagingSenderId: '749027687640',
  appId: '1:749027687640:web:c19dcf518506b2177e6bad',
  measurementId: 'G-7PEPN1C7CJ',
}

const getFirebaseConfig = () => {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error(
      'No Firebase configuration object provided.' +
      '\n' +
      "Add your web app's configuration object to firebase config.js",
    );
  } else {
    return firebaseConfig;
  }
};

const config = getFirebaseConfig();
export const firebaseApp = getApps().length ? getApp() : initializeApp(config);

export const db = getFirestore(firebaseApp);
export const rtdb = getDatabase(firebaseApp)
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
