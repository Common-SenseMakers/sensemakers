import fs from 'fs';

import { services } from './scripts.services';

const FILENAME = `all.nanopubs.data`;

(async () => {
  const filename = `${Date.now()}-${FILENAME}`;
  const fileStream = fs.createWriteStream(filename, { flags: 'w' });

  const allPostsIds = await services.postsManager.processing.posts.getAll();
  console.log(`Dropping ${allPostsIds.length} posts on ${filename}`);

  const allPosts = await Promise.all(
    allPostsIds.map((postId) => {
      return services.db.run((manager) => {
        // console.log(`Getting ${postId}`);
        return services.postsManager.processing.getPostFull(
          postId,
          manager,
          true
        );
      });
    })
  );

  for (const post of allPosts) {
    // console.log(`Writing ${post.id}`);
    fileStream.write(JSON.stringify(post) + '\n'); // Stringify each object and add a newline
  }

  fileStream.end();
  console.log(`Done. File ${filename} finished`);
})();
