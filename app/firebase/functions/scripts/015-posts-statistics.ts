import { app } from './scripts.services';

const firestore = app.firestore();

if (process.env.FB_PROJECT_ID !== 'sensenets-dataset') {
  throw new Error('Cannot run this script on other projects');
}

async function gatherPostsStatistics() {
  const [postsSnapshot, unprocessedSnapshot] = await Promise.all([
    firestore.collection('posts').get(),
    firestore.collection('posts').where('parsedStatus', '==', 'unprocessed').get()
  ]);
  
  const totalPosts = postsSnapshot.size;
  const unprocessedPosts = unprocessedSnapshot.size;

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
