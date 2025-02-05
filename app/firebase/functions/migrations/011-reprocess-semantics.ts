import { AppPost } from '../src/@shared/types/types.posts';
import { FetchAndProcess, fetchAndProcess } from '../src/db/db.utils';
import { servicesSource } from './migrations.services';

const DEBUG = true;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const config: FetchAndProcess<void, AppPost> = {
    fetchPage: async (lastElementId?: string) => {
      if (DEBUG) {
        console.log(`Fetching page with lastElementId: ${lastElementId}`);
      }

      const cluster = servicesSource.clusters.getInstance();
      const posts = await servicesSource.postsManager.processing.posts.getMany(
        {
          fetchParams: { expectedAmount: 100, untilId: lastElementId },
        },
        cluster
      );
      return {
        items: posts,
        lastId: posts[posts.length - 1]?.id,
      };
    },
    processItem: async (post: AppPost) => {
      try {
        await servicesSource.db.run(async (managerSource) => {
          if (DEBUG) {
            console.log(`Processing post ${post.id}`);
          }

          await servicesSource.postsManager.processing.processSemantics(
            post.id,
            managerSource,
            post.semantics
          );
        });
      } catch (error) {
        console.error(`Error processing ${post.id}`, error);
      }
    },
  };

  await fetchAndProcess(config);
})();
