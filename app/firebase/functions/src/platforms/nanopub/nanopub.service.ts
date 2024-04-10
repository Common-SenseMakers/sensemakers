import { Nanopub } from '@nanopub/sign';

import { UserDetailsBase } from '../../@shared/types/types';
import { NanopubUserProfile } from '../../@shared/types/types.nanopubs';
import { AppPostMirror } from '../../@shared/types/types.posts';
import { NANOPUBS_PUBLISH_SERVERS } from '../../config/config.runtime';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { FetchUserPostsParams, PlatformService } from '../platforms.interface';
import { createNanopublication } from './create.nanopub';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

/** Twitter service handles all interactions with Twitter API */
export class NanopubService
  implements
    PlatformService<undefined, undefined, UserDetailsBase<NanopubUserProfile>>
{
  constructor(protected time: TimeService) {}

  /** converts a post into a nanopublication string */
  async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostBase<string>> {
    const nanopubDraft = await createNanopublication(
      postAndAuthor.post,
      postAndAuthor.author
    );
    /** post_id is not defined until it's signed  */
    return {
      timestampMs: this.time.now(),
      draft: nanopubDraft.rdf(),
    };
  }

  /**
   * Receives a list of PostToPublish (platformPost, mirrors and user credentials) and returns
   * a list of the updated platformPosts
   */
  async publish(posts: PostToPublish[]): Promise<PlatformPost<any>[]> {
    const allPublished: PlatformPost<any>[] = [];

    await Promise.all(
      posts.map(async (post) => {
        const published = await Promise.all(
          post.mirrors.map(async (mirrorWithDraft) => {
            let nanopub: Nanopub | undefined = undefined;

            if (
              mirrorWithDraft.status === 'draft' &&
              mirrorWithDraft.postApproval === 'approved'
            ) {
              const draft = new Nanopub(mirrorWithDraft.platformDraft.original);

              let stop: boolean = false;
              let serverIx = 0;

              while (!stop) {
                try {
                  if (serverIx < NANOPUBS_PUBLISH_SERVERS.length) {
                    nanopub = await draft.publish(
                      undefined,
                      NANOPUBS_PUBLISH_SERVERS[serverIx]
                    );
                    stop = true;
                  } else {
                    stop = true;
                  }
                } catch (error) {
                  logger.error(
                    `Error publishing nanopub from ${NANOPUBS_PUBLISH_SERVERS[serverIx]}, retrying`,
                    error
                  );
                  serverIx++;
                }
              }
            }

            /** store the published nanopub */
            if (nanopub) {
              mirrorWithDraft.platformPost = nanopub.rdf();
              return mirrorWithDraft;
            }

            return undefined;
          })
        );

        allPublished.push();
      })
    );

    return allPublished;
  }

  convertToGeneric(platformPost: PlatformPost<any>): Promise<GenericPostData> {
    throw new Error('Method not implemented.');
  }

  fetch(params: FetchUserPostsParams[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }

  mirror(postsToMirror: AppPostMirror[]): Promise<PlatformPost<any>[]> {
    throw new Error('Method not implemented.');
  }
  getSignupContext(
    userId?: string | undefined,
    params?: any
  ): Promise<undefined> {
    throw new Error('Method not implemented.');
  }

  handleSignupData(
    signupData: undefined
  ): Promise<UserDetailsBase<NanopubUserProfile, any, any>> {
    throw new Error('Method not implemented.');
  }
}
