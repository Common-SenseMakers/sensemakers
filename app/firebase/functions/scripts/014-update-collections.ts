import { app } from './scripts.services';

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

    const userDoc = await firestore
      .collection('users')
      .doc(userId.split(':')[1])
      .get();
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

    const userDoc = await firestore
      .collection('users')
      .doc(authorId.split(':')[1])
      .get();
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
  const platformPostsSnapshot = await firestore
    .collection('platformPosts')
    .get();

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

    if (data.authorId) {
      const updatedData = { ...data };
      
      // Change createdAtMs to postCreatedAtMs
      updatedData.postCreatedAtMs = data.createdAtMs;
      delete updatedData.createdAtMs;

      // Update authorId to authorProfileId
      const [platformId, platformAccountId] = data.authorId.split(':');
      
      if (platformId === 'bluesky' || platformId === 'twitter') {
        updatedData.authorProfileId = `${platformId}-${platformAccountId}`;
      } else if (platformId === 'mastodon') {
        const userDoc = await firestore.collection('users').doc(platformAccountId).get();
        const userData = userDoc.data();
        if (userData && userData.mastodon && userData.mastodon[0]) {
          const globalUsername = `${userData.mastodon[0].profile.username}@${userData.mastodon[0].profile.mastodonServer}`;
          updatedData.authorProfileId = `mastodon-${globalUsername}`;
        } else {
          console.warn(`User document not found or invalid for Mastodon user: ${platformAccountId}`);
          continue;
        }
      } else {
        console.warn(`Unknown platform: ${platformId}`);
        continue;
      }

      delete updatedData.authorId;

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
