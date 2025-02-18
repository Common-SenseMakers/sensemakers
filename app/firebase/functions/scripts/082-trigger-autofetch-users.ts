import {
  triggerAutofetchPosts,
  triggerAutofetchPostsForNonUsers,
} from '../src/posts/tasks/posts.autofetch.task';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  await triggerAutofetchPosts(services);
  await triggerAutofetchPostsForNonUsers(services, false);
})();
