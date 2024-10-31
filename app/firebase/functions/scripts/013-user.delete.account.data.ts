import { app } from './scripts.services';

const mandatory = ['PLATFORM_ID', 'ACCOUNT_ID'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const platformId = process.env.PLATFORM_ID as string;
const accountId = process.env.ACCOUNT_ID as string;
const firestore = app.firestore();

if (process.env.FB_PROJECT_ID === 'sensenets-prod') {
  throw new Error('Cannot run this script on production');
}

(async () => {
  // Step 1: Count posts authored by the user with the specified platformId
  const postsSnapshot = await firestore
    .collection('posts')
    .where('authorProfileId', '==', `${platformId}-${accountId}`)
    .get();

  postsSnapshot.forEach((doc) => {
    doc.ref.delete(); // Delete the post
  });

  console.log(`Number of posts to delete: ${postsSnapshot.size}`);

  let postIdsToDelete: string[] = [];
  // Step 2: Count platformPosts documents that have an ID matching any of the mirrorsIds
  const platformPostSnapshot = await firestore
    .collection('platformPosts')
    .where('platformId', '==', platformId)
    .where('posted.author.id', '==', accountId)
    .get();
  platformPostSnapshot.forEach((doc) => {
    postIdsToDelete.push(doc.id);
    doc.ref.delete(); // Delete the platformPost document
  });

  console.log(
    `Number of platformPosts to delete: ${platformPostSnapshot.size}`
  );

  // Step 3: Count activity documents linked to the deleted posts
  const activityIdsToDelete: string[] = [];
  let activityCount = 0;

  const activitySnapshot = await firestore.collection('activity').get();
  activitySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.data && data.data.postId) {
      if (postIdsToDelete.includes(data.data.postId)) {
        activityIdsToDelete.push(doc.id);
        doc.ref.delete(); // Delete the activity document
        activityCount++;
      }
    }
  });

  console.log(`Number of activity documents to delete: ${activityCount}`);

  let profile;
  // Step 4: Count profiles with matching userId and platformId
  const profilesSnapshot = await firestore
    .collection('profiles')
    .where('platformId', '==', platformId)
    .where('profile.id', '==', accountId)
    .get();

  profilesSnapshot.forEach((doc) => {
    profile = doc.data();
    doc.ref.delete(); // Delete the profile document
  });

  console.log(`Number of profiles to delete: ${profilesSnapshot.size}`);

  let triplesCount = 0;
  const triplesSnapshot = await firestore.collection('triples').get();
  triplesSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.postId && postIdsToDelete.includes(data.postId)) {
      triplesCount++;
      doc.ref.delete(); // Delete the triple document
    }
  });
  console.log(`Number of triples to delete: ${triplesCount}`);

  if (profile.userId) {
    // Step 6: Count notifications from the user's subcollection that match the activityIds to be deleted
    let notificationsCount = 0;
    for (let i = 0; i < activityIdsToDelete.length; i += 10) {
      const chunk = activityIdsToDelete.slice(i, i + 10);
      const notificationsSnapshot = await firestore
        .collectionGroup('notifications')
        .where('userId', '==', profile.userId)
        .where('activityId', 'in', chunk)
        .get();
      notificationsCount += notificationsSnapshot.size;
      notificationsSnapshot.forEach((doc) => {
        doc.ref.delete(); // Delete the notification document
      });
    }
    console.log(`Number of notifications to delete: ${notificationsCount}`);
  }

  if (profile.userId) {
    // Step 7: Check if the user document exists
    const userDocRef = await firestore
      .collection('users')
      .doc(profile.userId)
      .get();
    const userDocExists = userDocRef.exists ? 1 : 0;

    if (userDocExists) {
      const userData = userDocRef.data();

      if (userData && userData.accounts) {
        const accountInfo = (userData.accounts[platformId] as any[]).filter(
          (account) => account.user_id !== accountId
        );
        // Create an object to update the accounts field
        const updatedAccounts = { ...userData.accounts };
        updatedAccounts[platformId] = accountInfo;
        delete updatedAccounts[platformId];

        // Update the document by removing the matching platformIds and updating the accounts
        await firestore.collection('users').doc(profile.userId).update({
          accounts: updatedAccounts,
        });

        console.log(
          `Platform '${platformId}' removed from accounts, and platformIds updated for userId: ${profile.userId}`
        );
      } else {
        console.log(
          `User document for userId: ${profile.userId} does not contain required fields or is missing.`
        );
      }
    } else {
      console.log(`User document does not exist for userId: ${profile.userId}`);
    }
    console.log(`User document exists (1 if yes, 0 if no): ${userDocExists}`);
  }

  console.log(
    `Summary for accountId: ${accountId} and platformId: ${platformId}`
  );
  console.log(`Posts: ${postsSnapshot.size}`);
  console.log(`PlatformPosts: ${platformPostSnapshot.size}`);
  console.log(`Activity documents: ${activityCount}`);
  console.log(`Profiles: ${profilesSnapshot.size}`);
  console.log(`Triples: ${triplesCount}`);
})();
