import { BskyAgent, AtpSessionEvent, AtpSessionData, RichText } from '@atproto/api';
import { PlatformFetchParams } from '../../@shared/types/types.fetch';
import { BlueskyUserDetails } from '../../@shared/types/types.bluesky';
import { FetchedResult, PlatformPostCreate, PlatformPostPosted } from '../../@shared/types/types.platform.posts';
import { AppPostFull, PostAndAuthor } from '../../@shared/types/types.posts';
import { AppUser, PLATFORM } from '../../@shared/types/types.user';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';

const DEBUG = true;
const DEBUG_PREFIX = 'BlueskyService';

export class BlueskyService implements PlatformService<any, any, BlueskyUserDetails> {
  private agent: BskyAgent;

  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository
  ) {
    this.agent = new BskyAgent({ service: 'https://bsky.social' });
  }

  public async getSignupContext(userId?: string, params?: any): Promise<any> {
    // Bluesky doesn't require a signup context for OAuth
    return {};
  }

  public async handleSignupData(signupData: any): Promise<BlueskyUserDetails> {
    if (DEBUG) logger.debug('handleSignupData', { signupData }, DEBUG_PREFIX);

    await this.agent.login({
      identifier: signupData.identifier,
      password: signupData.password,
    });

    const profile = await this.agent.getProfile({ actor: this.agent.session?.did });

    const bluesky: BlueskyUserDetails = {
      user_id: profile.data.did,
      signupDate: this.time.now(),
      profile: {
        id: profile.data.did,
        handle: profile.data.handle,
        displayName: profile.data.displayName,
        avatar: profile.data.avatar,
      },
      read: {
        accessJwt: this.agent.session?.accessJwt,
        refreshJwt: this.agent.session?.refreshJwt,
      },
      write: {
        accessJwt: this.agent.session?.accessJwt,
        refreshJwt: this.agent.session?.refreshJwt,
      },
    };

    if (DEBUG) logger.debug('handleSignupData result', { bluesky }, DEBUG_PREFIX);

    return bluesky;
  }

  public async fetch(
    params: PlatformFetchParams,
    userDetails: BlueskyUserDetails,
    manager: TransactionManager
  ): Promise<FetchedResult<any>> {
    if (DEBUG) logger.debug('fetch', { params, userDetails }, DEBUG_PREFIX);

    await this.agent.resumeSession(userDetails.read);

    const response = await this.agent.getAuthorFeed({
      actor: userDetails.user_id,
      limit: params.expectedAmount,
    });

    const posts = response.data.feed.map(item => ({
      post_id: item.post.uri,
      user_id: item.post.author.did,
      timestampMs: new Date(item.post.indexedAt).getTime(),
      post: item.post,
    }));

    return {
      fetched: {
        newest_id: posts[0]?.post_id,
        oldest_id: posts[posts.length - 1]?.post_id,
      },
      platformPosts: posts,
    };
  }

  public async convertToGeneric(platformPost: PlatformPostCreate<any>): Promise<any> {
    // Implement conversion logic here
    throw new Error('Method not implemented.');
  }

  public async publish(
    postPublish: any,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<any>> {
    if (DEBUG) logger.debug('publish', { postPublish }, DEBUG_PREFIX);

    await this.agent.resumeSession(postPublish.userDetails.write);

    const rt = new RichText({ text: postPublish.draft });
    await rt.detectFacets(this.agent);

    const response = await this.agent.post({
      text: rt.text,
      facets: rt.facets,
    });

    return {
      post_id: response.uri,
      user_id: this.agent.session?.did!,
      timestampMs: Date.now(),
      post: response,
    };
  }

  public async convertFromGeneric(postAndAuthor: PostAndAuthor): Promise<any> {
    // Implement conversion logic here
    throw new Error('Method not implemented.');
  }

  public async get(
    post_id: string,
    userDetails: BlueskyUserDetails,
    manager?: TransactionManager
  ): Promise<PlatformPostPosted<any>> {
    if (DEBUG) logger.debug('get', { post_id, userDetails }, DEBUG_PREFIX);

    await this.agent.resumeSession(userDetails.read);

    const response = await this.agent.getPostThread({ uri: post_id });

    return {
      post_id: response.data.thread.post.uri,
      user_id: response.data.thread.post.author.did,
      timestampMs: new Date(response.data.thread.post.indexedAt).getTime(),
      post: response.data.thread.post,
    };
  }

  // Implement other required methods here
}
