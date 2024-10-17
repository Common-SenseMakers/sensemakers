import fs from 'fs';

import { PLATFORM } from '../src/@shared/types/types.platforms';
import { PostsQueryStatus } from '../src/@shared/types/types.posts';
import { services } from './scripts.services';

(async () => {
  const data: any = {};
  const usersIds = await services.users.repo.getAll();

  console.log(`Processing ${usersIds.length} users`);

  await Promise.all(
    usersIds.map(async (userId) => {
      const publications = await services.postsManager.processing.posts.getMany(
        {
          userId,
          status: PostsQueryStatus.PUBLISHED,
          fetchParams: { expectedAmount: 100 },
        }
      );

      services.db.run(async (manager) => {
        const user = await services.users.getUserWithProfiles(userId, manager);

        console.log(
          `User ${user.email?.email} has ${publications.length} publications and autopost: ${user.settings.autopost[PLATFORM.Nanopub].value}`
        );

        data[userId] = { user, publications };
      });
    })
  );

  fs.writeFileSync(`users.dashboard.output.json`, JSON.stringify(data), 'utf8');
})();
