import { FieldValue } from 'firebase-admin/firestore';

import { app } from './scripts.services';

const mandatory = ['USER_ID', 'PLATFORM_ID'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const userId = process.env.USER_ID as string;
const platformId = process.env.PLATFORM_ID as string;
const firestore = app.firestore();

if (process.env.FB_PROJECT_ID === 'sensenets-prod') {
  throw new Error('Cannot run this script on production');
}

(async () => {
  // Step 1: Count posts authored by the user with the specified platformId
  const postsSnapshot = await firestore
    .collection('posts')
    .where('authorId', '==', userId)
    .where('origin', '==', platformId)
    .get();

  const postIdsToDelete: string[] = [];
  const mirrorsIdsToDelete: string[] = [];

  postsSnapshot.forEach((doc) => {
    const data = doc.data();
    postIdsToDelete.push(doc.id);

    // Check if mirrorsIds exists and is an array
    if (Array.isArray(data.mirrorsIds)) {
      mirrorsIdsToDelete.push(...data.mirrorsIds);
    }
    doc.ref.delete(); // Delete the post
  });

  console.log(`Number of posts to delete: ${postsSnapshot.size}`);

  // Step 2: Count platformPosts documents that have an ID matching any of the mirrorsIds
  let platformPostsCount = 0;
  for (const mirrorId of mirrorsIdsToDelete) {
    const platformPostRef = await firestore
      .collection('platformPosts')
      .doc(mirrorId)
      .get();
    if (platformPostRef.exists) {
      platformPostsCount++;
    }
    platformPostRef.ref.delete(); // Delete the platformPost
  }

  console.log(`Number of platformPosts to delete: ${platformPostsCount}`);

  // Step 3: Count activity documents linked to the deleted posts
  const activityIdsToDelete: string[] = [];
  let activityCount = 0;
  for (let i = 0; i < postIdsToDelete.length; i += 10) {
    const chunk = postIdsToDelete.slice(i, i + 10);
    const activitySnapshot = await firestore
      .collection('activity')
      .where('data.postId', 'in', chunk)
      .get();

    activitySnapshot.forEach((doc) => {
      activityIdsToDelete.push(doc.id);
      doc.ref.delete(); // Delete the activity document
    });

    activityCount += activitySnapshot.size;
  }

  console.log(`Number of activity documents to delete: ${activityCount}`);

  // Step 4: Count profiles with matching userId and platformId
  const profilesSnapshot = await firestore
    .collection('profiles')
    .where('userId', '==', userId)
    .where('platformId', '==', platformId)
    .get();

  profilesSnapshot.forEach((doc) => {
    doc.ref.delete(); // Delete the profile document
  });

  console.log(`Number of profiles to delete: ${profilesSnapshot.size}`);

  // Step 5: Count triples linked to the deleted posts
  let triplesCount = 0;
  for (let i = 0; i < postIdsToDelete.length; i += 10) {
    const chunk = postIdsToDelete.slice(i, i + 10);
    const triplesSnapshot = await firestore
      .collection('triples')
      .where('postId', 'in', chunk)
      .get();
    triplesCount += triplesSnapshot.size;

    triplesSnapshot.forEach((doc) => {
      doc.ref.delete(); // Delete the triple document
    });
  }

  console.log(`Number of triples to delete: ${triplesCount}`);

  // Step 6: Count notifications from the user's subcollection that match the activityIds to be deleted
  let notificationsCount = 0;
  for (let i = 0; i < activityIdsToDelete.length; i += 10) {
    const chunk = activityIdsToDelete.slice(i, i + 10);
    const notificationsSnapshot = await firestore
      .collectionGroup('notifications')
      .where('userId', '==', userId)
      .where('activityId', 'in', chunk)
      .get();
    notificationsCount += notificationsSnapshot.size;
    notificationsSnapshot.forEach((doc) => {
      doc.ref.delete(); // Delete the notification document
    });
  }

  console.log(`Number of notifications to delete: ${notificationsCount}`);

  // Step 7: Check if the user document exists
  const userDocRef = await firestore.collection('users').doc(userId).get();
  const userDocExists = userDocRef.exists ? 1 : 0;

  if (userDocExists) {
    const userData = userDocRef.data();

    if (userData && userData.platformIds && userData.accounts) {
      const updatedPlatformIds = userData.platformIds.filter(
        (id: string) => !id.startsWith(platformId)
      );

      // Create an object to update the accounts field
      const updatedAccounts = { ...userData.accounts };
      delete updatedAccounts[platformId];

      // Update the document by removing the matching platformIds and updating the accounts
      await firestore
        .collection('users')
        .doc(userId)
        .update({
          platformIds: updatedPlatformIds,
          accounts: updatedAccounts,
        });

      console.log(
        `Platform '${platformId}' removed from accounts, and platformIds updated for userId: ${userId}`
      );
    } else {
      console.log(
        `User document for userId: ${userId} does not contain required fields or is missing.`
      );
    }
  } else {
    console.log(`User document does not exist for userId: ${userId}`);
  }
  console.log(`User document exists (1 if yes, 0 if no): ${userDocExists}`);

  console.log(`Summary for userId: ${userId} and platformId: ${platformId}`);
  console.log(`Posts: ${postsSnapshot.size}`);
  console.log(`PlatformPosts: ${platformPostsCount}`);
  console.log(`Activity documents: ${activityCount}`);
  console.log(`Profiles: ${profilesSnapshot.size}`);
  console.log(`Triples: ${triplesCount}`);
  console.log(`Notifications: ${notificationsCount}`);
  console.log(`User document: ${userDocExists}`);
})();
