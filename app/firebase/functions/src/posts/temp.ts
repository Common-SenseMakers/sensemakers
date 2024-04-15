// /**
//    * Receive data about posts to mirror, validates it, and stores the platformPosts
//    * It does not publishes them!
//    * */
// public async approveMirrors(
//     postsToMirror: AppPostMirror[],
//     authenticatedUserId: string
//   ) {
//     const updatedPosts: PlatformPost[] = [];

//     /**
//      * Verify that publishing of mirror is triggered by the post author and mark as 'approved'
//      * */
//     await Promise.all(
//       postsToMirror.map(async (postToMirror) => {
//         /** verify authorship */
//         const post = await this.repo.getPost(postToMirror.postId, true);

//         if (post.authorId !== authenticatedUserId) {
//           throw new Error(
//             `Post ${post.id} not owned by ${authenticatedUserId}`
//           );
//         }

//         /** get mirrors */
//         postToMirror.mirrors.map((mirror) => {
//           /**
//            * mirrors must be existing PlatformPost, they MAY have been changed
//            * by the author
//            */
//           if (!mirror.draft) {
//             throw new Error(
//               `Unexpected trying to mark as approved a platoform post ${JSON.stringify(mirror)} without draftStatus`
//             );
//           }

//           mirror = {
//             ...mirror,
//             draft: {
//               user_id: mirror.draft.user_id,
//               post: mirror.draft.post,
//               postApproval: 'approved',
//             },
//           };

//           updatedPosts.push(mirror);
//         });
//       })
//     );

//     await this.updatePlatformPosts(updatedPosts);
//   }

//   /**
//    * Reads all unpublished platform posts, publishes them, update the
//    * platformPosts in the DB */
//   async publishUnpublishedPosts() {
//     /** get unpublished posts */
//     const platformPosts: PlatformPost[] = []; // this.repo.getUnpublishedPlatformPosts();

//     /** prepare author credentials for each platform and account */
//     const perPlatform: PerPlatformPublish = new Map();
//     await Promise.all(
//       platformPosts.map(async (platformPost) => {
//         const platformId = platformPost.platformId;
//         const current = perPlatform.get(platformId) || [];

//         if (!platformPost.draft) {
//           throw new Error(
//             `Unexpected. PlatformPost ${platformPost.id} does not have draftStatus`
//           );
//         }

//         const author = await this.users.repo.getUserWithPlatformAccount(
//           platformId,
//           platformPost.draft.user_id,
//           true
//         );

//         /** Get the crendetinals that platform:user_id */
//         const account = UsersHelper.getAccount(
//           author,
//           platformId,
//           platformPost.draft.user_id,
//           true
//         );

//         const postToPublish: PlatformPostPublish = {
//           draft: platformPost.draft?.post,
//           id: platformPost.id,
//         };

//         current.push({ platformPost: postToPublish, userDetails: account });
//         perPlatform.set(platformId as PLATFORM, current);
//       })
//     );

//     const updatedPlatformPosts: PlatformPost[] = [];

//     /**
//      * Publish platformPosts and update the status
//      * */
//     await Promise.all(
//       Array.from(perPlatform.entries()).map(
//         async ([platformId, postsToPublish]) => {
//           /** publish on platform as batch */
//           const publishedPosts = await this.platforms
//             .get(platformId)
//             .publish(postsToPublish);

//           /** update the platformPost status with the resutls */
//           publishedPosts.forEach((publishedPost) => {
//             /** find the corresponding platformPost */
//             const platformPost = platformPosts.find(
//               (post) => publishedPost.id === post.id
//             );

//             if (!platformPost) {
//               throw new Error(
//                 `Unexpected. PlatformPost for published post ${JSON.stringify(publishedPost)} not found`
//               );
//             }

//             const updatedPost: PlatformPost = {
//               ...platformPost,
//               status: 'posted',
//             };

//             updatedPlatformPosts.push(updatedPost);
//           });
//         }
//       )
//     );

//     await this.updatePlatformPosts(updatedPlatformPosts);
//   }

//   async updatePlatformPosts(platformPosts: PlatformPost[]) {
//     await this.repo.updatePostsMirrors(platformPosts);
//   }

//   async storePlatformPosts(platformPosts: PlatformPost[]) {
//     await this.repo.storePostsMirrors(platformPosts);
//   }

//   /**
//    * Calls the convertFromGeneric on all platforms and returns the results as PlatformPosts
//    * */
//   public async prepareDrafts(postsAndAuthors: PostAndAuthor[]) {
//     const allPlatformPosts: PlatformPost[] = [];

//     postsAndAuthors.forEach((postAndAuthor) => {
//       ALL_PUBLISH_PLATFORMS.forEach((platformId) => {
//         if (postAndAuthor.post.origin !== platformId) {
//           const draft = this.platforms
//             .get(platformId)
//             .convertFromGeneric(postAndAuthor);

//           const accounts = UsersHelper.getAccounts(
//             postAndAuthor.author,
//             platformId,
//             true
//           );

//           accounts.forEach((account) => {
//             const platformPost: PlatformPost = {
//               id: getUniquePostId(platformId, postAndAuthor.post.id),
//               platformId,
//               status: 'draft',
//               draft: {
//                 post: draft,
//                 postApproval: 'pending',
//                 user_id: account.user_id,
//               },
//             };

//             allPlatformPosts.push(platformPost);
//           });
//         }
//       });
//     });

//     return allPlatformPosts;
//   }
