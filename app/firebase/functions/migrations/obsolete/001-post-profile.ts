// import { PLATFORM } from '../src/@shared/types/types.platforms';
// import { logger } from '../src/instances/logger';
// import { UsersHelper } from '../src/users/users.helper';
// import { servicesSource } from './migrations.services';

// (async () => {
//   const platformPostsIds =
//     await servicesSource.postsManager.processing.platformPosts.getAll();

//   logger.info(`Processing ${platformPostsIds.length} platformPosts`);

//   await Promise.all(
//     platformPostsIds.map(async (platformPostsId) => {
//       // for (const platformPostsId of platformPostsIds) {
//       await servicesSource.db.run(async (manager) => {
//         const platformPost =
//           await servicesSource.postsManager.processing.platformPosts.get(
//             platformPostsId,
//             manager,
//             true
//           );

//         if (
//           platformPost.posted &&
//           platformPost.platformId === PLATFORM.Twitter
//         ) {
//           logger.info(`Processing platformPostsId: ${platformPostsId}`);

//           const authorProfile = await servicesSource.users.profiles.getProfile(
//             platformPost.platformId,
//             platformPost.posted.user_id,
//             manager,
//             true
//           );

//           if (!authorProfile.userId) {
//             const author = await servicesSource.users.repo.getUser(
//               authorId.userId,
//               manager,
//               true
//             );

//             const account = UsersHelper.getAccount(
//               author,
//               platformPost.platformId,
//               platformPost.posted.user_id,
//               true
//             );

//             platformPost.posted.author = account.profile;

//             logger.info(
//               `Updating platformPostsId: ${platformPostsId} - author: ${author.email?.email} - account: ${account.profile?.username}`
//             );

//             await servicesSource.postsManager.processing.platformPosts.update(
//               platformPostsId,
//               { posted: platformPost.posted },
//               manager
//             );
//           }
//         }
//       });
//     })
//   );
// })();
