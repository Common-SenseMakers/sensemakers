import { app } from './scripts.services';

const firestore = app.firestore();

if (process.env.FB_PROJECT_ID !== 'sensenets-dataset') {
  throw new Error('Cannot run this script on other projects');
}

async function gatherPostsStatistics() {
  const postsSnapshot = await firestore.collection('posts').get();
  const totalPosts = postsSnapshot.size;
  
  let unprocessedPosts = 0;
  postsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.parsedStatus === 'unprocessed') {
      unprocessedPosts++;
    }
  });

  console.log('Posts Statistics:');
  console.log('----------------');
  console.log(`Total posts: ${totalPosts}`);
  console.log(`Unprocessed posts: ${unprocessedPosts}`);
  console.log(`Processed posts: ${totalPosts - unprocessedPosts}`);
  console.log(`Unprocessed percentage: ${((unprocessedPosts / totalPosts) * 100).toFixed(2)}%`);
}

(async () => {
  try {
    await gatherPostsStatistics();
  } catch (error) {
    console.error('Error gathering posts statistics:', error);
  }
})();
