import { initializeApp } from 'firebase/app';
import {
  collection,
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';

import { CollectionNames } from '../shared/utils/collectionNames';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const isProd =
  process.env.NODE_ENV === 'production' ||
  (process as any).env.NODE_ENV === 'test-prod';

if (!isProd) {
  console.log(
    'RUNNING ON DEVELOPMENT NODE - CONNECTING TO LOCALSTORE FIRESTORE'
  );
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export const collections = {
  post: (postId: string) => collection(db, CollectionNames.Posts, postId),
};
