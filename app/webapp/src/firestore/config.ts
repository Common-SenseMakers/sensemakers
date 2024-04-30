import { initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
} from 'firebase/firestore';

import { CollectionNames } from '../shared/utils/collectionNames';

const firebaseConfig = {
  apiKey: 'AIzaSyCCrMwEZjqpFkXJhp02R1xFzGjX0p9M6mE',
  authDomain: 'sensenets-9ef26.firebaseapp.com',
  projectId: 'sensenets-9ef26',
  storageBucket: 'sensenets-9ef26.appspot.com',
  messagingSenderId: '309994696558',
  appId: '1:309994696558:web:b17357718ef22fdaf39b7f',
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
};
