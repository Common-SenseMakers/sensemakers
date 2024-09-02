import fs from 'fs';

import { PLATFORM } from '../src/@shared/types/types.user';
import { servicesSource } from './migrations.services';
import { UsersHelper } from '../src/users/users.helper';

(async () => {
  const platformPostsIds = await servicesSource.postsManager.processing.platformPosts.getAll();

  console.log(`Processing ${platformPostsIds.length} platformPosts`);

  await Promise.all(
    platformPostsIds.map(async (platformPostsId) => {
      servicesSource.db.run(async (manager) => {
        const platformPost = await servicesSource.postsManager.processing.platformPosts.get(platformPostsId, manager, true);
        
        if (platformPost.posted && platformPost.platformId === PLATFORM.Twitter) {
          console.log(`Processing platformPostsId: ${platformPostsId}`);

          const author = await servicesSource.users.repo.getUser(platformPost.posted.user_id, manager, true);
          const account =  UsersHelper.getAccount(author, platformPost.platformId, platformPost.posted.user_id, true); ;

          console.log(`Processing platformPostsId: ${platformPostsId} - author: ${author.email?.email} - account: ${account.profile?.username}`);
          platformPost.posted.author = account.profile;
          
          await servicesSource.postsManager.processing.platformPosts.update(platformPostsId, {posted: platformPost.posted}, manager);
        }
      });
    })
  );
})();
