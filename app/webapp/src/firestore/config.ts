import { initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
} from 'firebase/firestore';

import { CollectionNames } from '../shared/utils/collectionNames';

const firebaseConfig = {
  apiKey: process.env.FB_APIKEY,
  authDomain: process.env.FB_AUTHDOMAIN,
  projectId: process.env.FB_PROJECTID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APPID,
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
  post: (postId: string) => doc(db, CollectionNames.Posts, postId),
  platformPost: (id: string) => doc(db, CollectionNames.PlatformPosts, id),
  updates: (id: string) => doc(db, CollectionNames.Updates, id),
};
