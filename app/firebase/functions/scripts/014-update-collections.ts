import { app } from './scripts.services';
import { firestore } from 'firebase-admin';

const firestore = app.firestore();

async function updateCollections() {
  await updateProfiles();
  await updatePosts();
  await updatePlatformPosts();
  await removeUserDocs();
  await updateTriples();
}

async function updateProfiles() {
  const profilesSnapshot = await firestore.collection('profiles').get();
  
  for (const doc of profilesSnapshot.docs) {
    const data = doc.data();
    const userId = data.profile.userId || data.profile.user_id;
    const platformId = data.platformId;
    
    if (!userId || !platformId) continue;

    const userDoc = await firestore.collection('users').doc(userId.split(':')[1]).get();
    const userData = userDoc.data();

    if (!userData) continue;

    const newProfileData = {
      platformId,
      profile: {
        id: data.profile.id,
        name: data.profile.name || data.profile.displayName || '',
        username: data.profile.username || '',
        avatar: data.profile.avatar || '',
      },
      fetched: userData.accounts[platformId]?.fetched || {},
    };

    if (platformId === 'mastodon') {
      newProfileData.profile.username = `${data.profile.username}@${data.profile.mastodonServer || ''}`;
      delete newProfileData.profile.mastodonServer;
    }

    const newDocId = `${platformId}:${data.profile.id}`;
    await firestore.collection('profiles').doc(newDocId).set(newProfileData);
    await doc.ref.delete();
  }

  console.log('Profiles updated');
}

async function updatePosts() {
  const postsSnapshot = await firestore.collection('posts').get();

  for (const doc of postsSnapshot.docs) {
    const data = doc.data();
    const origin = data.origin;
    const authorId = data.authorId;

    if (!origin || !authorId) continue;

    const userDoc = await firestore.collection('users').doc(authorId.split(':')[1]).get();
    const userData = userDoc.data();

    if (!userData) continue;

    const accountInfo = userData.accounts[origin];
    if (!accountInfo) continue;

    const updatedData = {
      ...data,
      generic: {
        ...data.generic,
        author: {
          ...data.generic.author,
          ...accountInfo.profile,
        },
      },
      authorProfileId: `${origin}:${accountInfo.profile.id}`,
    };

    delete updatedData.authorId;

    await doc.ref.set(updatedData);
  }

  console.log('Posts updated');
}

async function updatePlatformPosts() {
  const platformPostsSnapshot = await firestore.collection('platformPosts').get();

  for (const doc of platformPostsSnapshot.docs) {
    const data = doc.data();

    if (data.platformId === 'mastodon') {
      const updatedData = {
        ...data,
        post_id: data.posted.post.id,
        'posted.post_id': data.posted.post.id,
        'posted.user_id': data.posted.post.account.id,
      };

      await doc.ref.set(updatedData);
    }
  }

  console.log('PlatformPosts updated');
}

async function removeUserDocs() {
  const userDocs = await firestore.collection('users').get();
  const batch = firestore.batch();

  userDocs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log('User documents removed');
}

async function updateTriples() {
  const triplesSnapshot = await firestore.collection('triples').get();

  for (const doc of triplesSnapshot.docs) {
    const data = doc.data();

    if (data.authorId && data.authorId.startsWith('mastodon:')) {
      const updatedData = {
        ...data,
        authorId: `mastodon:${data.authorId.split(':')[1]}@${data.authorId.split(':')[2] || ''}`,
      };

      await doc.ref.set(updatedData);
    }
  }

  console.log('Triples updated');
}

(async () => {
  try {
    await updateCollections();
    console.log('All collections updated successfully');
  } catch (error) {
    console.error('Error updating collections:', error);
  }
})();
