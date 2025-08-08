import { initializeApp } from 'firebase/app';
//import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database'
import { getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

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
// export const analytics = getAnalytics(firebaseApp);

