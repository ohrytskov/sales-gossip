import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database'
import { getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBdfsG96Tvk0I_2A817xQswz4IF9BnEKpo',
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
