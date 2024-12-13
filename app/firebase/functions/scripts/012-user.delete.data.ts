import { app } from './scripts.services';

const mandatory = ['USER_ID'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const userId = process.env.USER_ID as string;
const firestore = app.firestore();

(async () => {
  // Step 1: Count posts authored by the user
  const postsSnapshot = await firestore
    .collection('posts')
    .where('authorUserId', '==', userId)
    .get();

  const postIdsToDelete: string[] = [];
  const mirrorsIdsToDelete: string[] = [];

  postsSnapshot.forEach((doc) => {
    const data = doc.data();
    postIdsToDelete.push(doc.id);
    mirrorsIdsToDelete.push(...data.mirrorsIds);
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
  let activityCount = 0;
  for (let i = 0; i < postIdsToDelete.length; i += 10) {
    const chunk = postIdsToDelete.slice(i, i + 10);
    const activitySnapshot = await firestore
      .collection('activity')
      .where('data.postId', 'in', chunk)
      .get();
    activityCount += activitySnapshot.size;
    activitySnapshot.forEach((doc) => {
      doc.ref.delete(); // Delete the activity document
    });
  }

  console.log(`Number of activity documents to delete: ${activityCount}`);

  // Step 4: Count profiles with matching userId
  const profilesSnapshot = await firestore
    .collection('profiles')
    .where('userId', '==', userId)
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

  // Step 6: Count notifications from the user's subcollection
  const userDocRefForSub = firestore.collection('users').doc(userId);
  const notificationsSnapshot = await userDocRefForSub
    .collection('notifications')
    .where('userId', '==', userId)
    .get();
  notificationsSnapshot.forEach((doc) => {
    doc.ref.delete(); // Delete the notification document
  });

  console.log(
    `Number of notifications to delete: ${notificationsSnapshot.size}`
  );

  // Step 7: Check if the user document exists
  const userDocRef = await firestore.collection('users').doc(userId).get();
  const userDocExists = userDocRef.exists ? 1 : 0;
  if (userDocExists) {
    await userDocRef.ref.delete(); // Delete the user document
  }

  console.log(`User document exists (1 if yes, 0 if no): ${userDocExists}`);

  console.log(`Summary for userId: ${userId}`);
  console.log(`Posts: ${postsSnapshot.size}`);
  console.log(`PlatformPosts: ${platformPostsCount}`);
  console.log(`Activity documents: ${activityCount}`);
  console.log(`Profiles: ${profilesSnapshot.size}`);
  console.log(`Triples: ${triplesCount}`);
  console.log(`Notifications: ${notificationsSnapshot.size}`);
  console.log(`User document: ${userDocExists}`);
})();
