import { autofetchUserPosts } from '../src/posts/tasks/posts.autofetch.task';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const userId = process.env.USER_ID;
  if (!userId) {
    throw new Error('USER_ID not defined in .script.env');
  }

  await autofetchUserPosts(
    {
      data: {
        userId,
      },
    },
    services
  );
})();
