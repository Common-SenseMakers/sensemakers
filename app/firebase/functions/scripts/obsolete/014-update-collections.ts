import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { mapStoreElements, parseRDF } from '../../src/@shared/utils/n3.utils';
import { parseMastodonAccountURI } from '../../src/platforms/mastodon/mastodon.utils';
import { app } from '../scripts.services';

const firestore = app.firestore();

if (process.env.FB_PROJECT_ID !== 'sensenets-dataset') {
  throw new Error('Cannot run this script on other projects');
}

async function updateCollections() {
  await updateProfiles();
  await updatePosts();
  await updatePlatformPosts();
  await updateTriples();
  // await removeUserDocs();
}

async function updateProfiles() {
  const profilesSnapshot = await firestore.collection('profiles').get();
  let batch = firestore.batch();
  let batchCount = 0;

  for (const doc of profilesSnapshot.docs) {
    const data = doc.data();
    const userId = data.userId;
    const platformId = data.platformId;

    if (!userId || !platformId) continue;

    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) continue;

    const avatar = (() => {
      if (platformId === PLATFORM.Mastodon) {
        return (
          data.profile.avatar ||
          'https://mastodon.social/avatars/original/missing.png'
        );
      }
      if (platformId === PLATFORM.Twitter) {
        return data.profile.profile_image_url;
      }
      if (platformId === PLATFORM.Bluesky) {
        return data.profile.avatar;
      }
      return data.profile.avatar;
    })();

    const username = (() => {
      if (platformId === PLATFORM.Mastodon) {
        return `${data.profile.username}@${data.profile.mastodonServer}`;
      }
      return data.profile.username;
    })();

    const displayName = (() => {
      if (platformId === PLATFORM.Mastodon) {
        return data.profile.displayName || username;
      }
      return data.profile.name || username;
    })();

    const fetched = (() => {
      if (userData.accounts && userData.accounts[platformId]) {
        return userData.accounts[platformId][0].fetched || {};
      }
      return userData[platformId][0].fetched || {};
    })();

    if (platformId === PLATFORM.Mastodon) {
      const newest_id = `https://${data.profile.mastodonServer}/users/${data.profile.username}/statuses/${fetched.newest_id}`;
      const oldest_id = `https://${data.profile.mastodonServer}/users/${data.profile.username}/statuses/${fetched.oldest_id}`;
      fetched.newest_id = newest_id;
      fetched.oldest_id = oldest_id;
    }

    const user_id = (() => {
      if (platformId === PLATFORM.Mastodon) {
        return `${data.profile.username}@${data.profile.mastodonServer}`;
      }
      return data.profile.id;
    })();
    const newProfileData = {
      platformId,
      profile: {
        id: data.profile.id,
        displayName,
        username,
        avatar,
      },
      fetched,
      user_id,
    };

    if (platformId === 'mastodon') {
      newProfileData.profile.username = `${data.profile.username}@${data.profile.mastodonServer || ''}`;
    }

    const newDocId = `${platformId}-${user_id}`;
    batch.set(firestore.collection('profiles').doc(newDocId), newProfileData);
    batch.delete(doc.ref);

    batchCount++;

    if (batchCount === 200) {
      await batch.commit();
      batch = firestore.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
}

async function updatePosts() {
  const postsSnapshot = await firestore.collection('posts').get();
  let batch = firestore.batch();
  let batchCount = 0;

  for (const doc of postsSnapshot.docs) {
    const data = doc.data();
    const origin = data.origin;
    const authorId = data.authorId;

    if (!origin || !authorId) continue;

    const userDoc = await firestore.collection('users').doc(authorId).get();
    const userData = userDoc.data();

    if (!userData) continue;

    const accountInfo = (() => {
      if (userData.accounts && userData.accounts[origin]) {
        return userData.accounts[origin][0];
      }
      return userData[origin][0];
    })();

    if (!accountInfo) continue;

    const avatarUrl = (() => {
      if (origin === PLATFORM.Mastodon) {
        return (
          accountInfo.profile.avatar ||
          'https://mastodon.social/avatars/original/missing.png'
        );
      }
      if (origin === PLATFORM.Twitter) {
        return accountInfo.profile.profile_image_url;
      }
      if (origin === PLATFORM.Bluesky) {
        return accountInfo.profile.avatar;
      }
      return accountInfo.profile.avatar;
    })();
    const username = (() => {
      if (origin === PLATFORM.Mastodon) {
        return `${accountInfo.profile.username}@${accountInfo.profile.mastodonServer}`;
      }
      return accountInfo.profile.username;
    })();
    const platformAccountId = (() => {
      if (origin === PLATFORM.Mastodon) {
        return `${accountInfo.profile.username}@${accountInfo.profile.mastodonServer}`;
      }
      return accountInfo.profile.id;
    })();

    const updatedData: any = {
      ...data,
      generic: {
        ...data.generic,
        author: {
          ...data.generic.author,
          avatarUrl,
          username,
        },
      },
      authorProfileId: `${origin}-${platformAccountId}`,
    };

    delete updatedData.authorId;
    if (data.originalParsed) {
      const { keywords, labels } = await processSemanticsWithoutTransaction(
        data.originalParsed.semantics
      );
      updatedData.keywords = keywords;
      updatedData.labels = labels;
    }

    batch.set(doc.ref, updatedData);
    batchCount++;

    if (batchCount === 200) {
      await batch.commit();
      batch = firestore.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
}

async function updatePlatformPosts() {
  const platformPostsSnapshot = await firestore
    .collection('platformPosts')
    .get();
  let batch = firestore.batch();
  let batchCount = 0;

  for (const doc of platformPostsSnapshot.docs) {
    const data = doc.data();
    if (!data.post_id) {
      const updatedData = { ...data };
      if (data.platformId === PLATFORM.Mastodon) {
        const mastodonPostId = data.posted.post.posts[0].uri;
        const mastodonUserId = parseMastodonAccountURI(
          data.posted.post.author.url
        ).globalUsername;

        updatedData.posted.post.thread_id = mastodonPostId;
        updatedData.posted.user_id = mastodonUserId;
        updatedData.posted.post_id = mastodonPostId;
        updatedData.post_id = mastodonPostId;
      } else {
        updatedData.post_id = data.posted.post_id;
      }
      batch.set(doc.ref, updatedData);
      batchCount++;

      if (batchCount === 200) {
        await batch.commit();
        batch = firestore.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
}

// async function removeUserDocs() {
//   const userDocs = await firestore.collection('users').get();
//   const batch = firestore.batch();

//   userDocs.forEach((doc) => {
//     batch.delete(doc.ref);
//   });

//   await batch.commit();
// }

async function updateTriples() {
  const triplesSnapshot = await firestore.collection('triples').get();
  let batch = firestore.batch();
  let batchCount = 0;

  for (const doc of triplesSnapshot.docs) {
    const data = doc.data();

    if (data.authorId) {
      const updatedData = { ...data };

      // Change createdAtMs to postCreatedAtMs
      if (data.createdAtMs) {
        updatedData.postCreatedAtMs = data.createdAtMs;
        delete updatedData.createdAtMs;
      }

      // Update authorId to authorProfileId
      const [platformId, ...rest] = data.authorId.split(':');
      const platformAccountId = rest.join(':');

      if (platformId === PLATFORM.Bluesky || platformId === PLATFORM.Twitter) {
        updatedData.authorProfileId = `${platformId}-${platformAccountId}`;
      } else if (platformId === PLATFORM.Mastodon) {
        const userDoc = await firestore
          .collection('users')
          .doc(data.authorId)
          .get();
        const userData = userDoc.data();
        if (userData && userData.mastodon && userData.mastodon[0]) {
          const globalUsername = `${userData.mastodon[0].profile.username}@${userData.mastodon[0].profile.mastodonServer}`;
          updatedData.authorProfileId = `${PLATFORM.Mastodon}-${globalUsername}`;
        } else {
          console.warn(
            `User document not found or invalid for Mastodon user: ${platformAccountId}`
          );
          continue;
        }
      } else {
        continue;
      }

      delete updatedData.authorId;

      batch.set(doc.ref, updatedData);
      batchCount++;

      if (batchCount === 200) {
        await batch.commit();
        batch = firestore.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
}

(async () => {
  try {
    await updateCollections();
    console.log('All collections updated successfully');
  } catch (error) {
    console.error('Error updating collections:', error);
  }
})();

async function processSemanticsWithoutTransaction(
  semantics: string
): Promise<{ labels: string[]; keywords: string[] }> {
  const store = await parseRDF(semantics);

  const labels: Set<string> = new Set();
  const keywords: Set<string> = new Set();

  mapStoreElements(store, (q) => {
    if (q.predicate.value === 'https://schema.org/keywords') {
      keywords.add(q.object.value);
    } else {
      labels.add(q.predicate.value);
    }
  });

  return {
    labels: Array.from(labels),
    keywords: Array.from(keywords),
  };
}
