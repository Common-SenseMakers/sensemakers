import { PLATFORM } from '../src/@shared/types/types.platforms';
import { parseMastodonAccountURI } from '../src/platforms/mastodon/mastodon.utils';
import { app } from './scripts.services';

const firestore = app.firestore();

if (process.env.FB_PROJECT_ID !== 'sensenets-dataset') {
  throw new Error('Cannot run this script on other projects');
}

async function updateCollections() {
  // await updateProfiles();
  // await updatePosts();
  // await updatePlatformPosts();
  // await removeUserDocs();
  await updateTriples();
}

// async function updateProfiles() {
//   const profilesSnapshot = await firestore.collection('profiles').get();

//   for (const doc of profilesSnapshot.docs) {
//     const data = doc.data();
//     const userId = data.profile.userId || data.profile.user_id;
//     const platformId = data.platformId;

//     if (!userId || !platformId) continue;

//     const userDoc = await firestore
//       .collection('users')
//       .doc(userId.split(':')[1])
//       .get();
//     const userData = userDoc.data();

//     if (!userData) continue;

//     const newProfileData = {
//       platformId,
//       profile: {
//         id: data.profile.id,
//         name: data.profile.name || data.profile.displayName || '',
//         username: data.profile.username || '',
//         avatar: data.profile.avatar || '',
//       },
//       fetched: userData.accounts[platformId]?.fetched || {},
//     };

//     if (platformId === 'mastodon') {
//       newProfileData.profile.username = `${data.profile.username}@${data.profile.mastodonServer || ''}`;
//       //@ts-ignore
//       delete newProfileData.profile.mastodonServer;
//     }

//     const newDocId = `${platformId}:${data.profile.id}`;
//     await firestore.collection('profiles').doc(newDocId).set(newProfileData);
//     await doc.ref.delete();
//   }

//   console.log('Profiles updated');
// }

// async function updatePosts() {
//   const postsSnapshot = await firestore.collection('posts').get();

//   for (const doc of postsSnapshot.docs) {
//     const data = doc.data();
//     const origin = data.origin;
//     const authorId = data.authorId;

//     if (!origin || !authorId) continue;

//     const userDoc = await firestore
//       .collection('users')
//       .doc(authorId.split(':')[1])
//       .get();
//     const userData = userDoc.data();

//     if (!userData) continue;

//     const accountInfo = userData.accounts[origin];
//     if (!accountInfo) continue;

//     const updatedData = {
//       ...data,
//       generic: {
//         ...data.generic,
//         author: {
//           ...data.generic.author,
//           ...accountInfo.profile,
//         },
//       },
//       authorProfileId: `${origin}:${accountInfo.profile.id}`,
//     };

//     //@ts-ignore
//     delete updatedData.authorId;

//     await doc.ref.set(updatedData);
//   }

//   console.log('Posts updated');
// }

async function updatePlatformPosts() {
  const platformPostsSnapshot = await firestore
    .collection('platformPosts')
    .get();

  let count = 0;
  for (const doc of platformPostsSnapshot.docs) {
    if (count >= 5) break;
    count++;
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
      console.log('Updating platformPost:', { updatedData, docId: doc.id });
      await doc.ref.set(updatedData);
    }
  }
}

// async function removeUserDocs() {
//   const userDocs = await firestore.collection('users').get();
//   const batch = firestore.batch();

//   userDocs.forEach((doc) => {
//     batch.delete(doc.ref);
//   });

//   await batch.commit();
//   console.log('User documents removed');
// }

async function updateTriples() {
  const triplesSnapshot = await firestore.collection('triples').get();

  let count = 0;
  for (const doc of triplesSnapshot.docs) {
    if (count >= 5) break;
    const data = doc.data();
    count++;

    if (data.authorId) {
      const updatedData = { ...data };

      // Change createdAtMs to postCreatedAtMs
      if (data.createdAtMs) {
        updatedData.postCreatedAtMs = data.createdAtMs;
        delete updatedData.createdAtMs;
      } else {
        console.warn(`No createdAtMs for triple: ${doc.id}`);
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
        console.warn(`Unknown platform: ${platformId}`);
        continue;
      }

      delete updatedData.authorId;

      console.log('Updating triple:', { updatedData, docId: doc.id });

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
