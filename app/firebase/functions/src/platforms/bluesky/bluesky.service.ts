import AtpAgent, {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  RichText,
} from '@atproto/api';

import {
  BlueskyPost,
  BlueskySignupContext,
  BlueskySignupData,
  BlueskyThread,
  BlueskyUserDetails,
} from '../../@shared/types/types.bluesky';
import { PlatformFetchParams } from '../../@shared/types/types.fetch';
import {
  FetchedResult,
  PlatformPostCreate,
  PlatformPostDeleteDraft,
  PlatformPostDraft,
  PlatformPostPosted,
  PlatformPostUpdate,
} from '../../@shared/types/types.platform.posts';
import { AppPostFull, PostAndAuthor } from '../../@shared/types/types.posts';
import { AppUser } from '../../@shared/types/types.user';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';
import {
  convertBlueskyPostsToThreads,
  extractRKeyFromURI,
} from './bluesky.utils';

const DEBUG = true;
const DEBUG_PREFIX = 'BlueskyService';

export class BlueskyService
  implements
    PlatformService<
      BlueskySignupContext,
      BlueskySignupData,
      BlueskyUserDetails
    >
{
  private agent: AtpAgent;

  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository
  ) {
    this.agent = new AtpAgent({ service: 'https://bsky.social' });
  }

  public async getSignupContext(userId?: string, params?: any): Promise<any> {
    // Bluesky doesn't require a signup context for OAuth
    return {};
  }

  public async handleSignupData(
    signupData: BlueskySignupData
  ): Promise<BlueskyUserDetails> {
    if (DEBUG) logger.debug('handleSignupData', { signupData }, DEBUG_PREFIX);

    await this.agent.login({
      identifier: signupData.username,
      password: signupData.appPassword,
    });
    if (!this.agent.session) {
      throw new Error('Failed to login to Bluesky');
    }

    const profile = await this.agent.getProfile({
      actor: this.agent.session.did,
    });

    const bluesky: BlueskyUserDetails = {
      user_id: profile.data.did,
      signupDate: this.time.now(),
      profile: {
        id: profile.data.did,
        username: profile.data.handle,
        name: profile.data.displayName || profile.data.handle,
        avatar: profile.data.avatar || '',
      },
      read: {
        appPassword: signupData.appPassword,
      },
      write: {
        appPassword: signupData.appPassword,
      },
    };

    if (DEBUG)
      logger.debug('handleSignupData result', { bluesky }, DEBUG_PREFIX);

    return bluesky;
  }

  public async fetch(
    params: PlatformFetchParams,
    userDetails: BlueskyUserDetails,
    manager: TransactionManager
  ): Promise<FetchedResult<BlueskyThread>> {
    if (DEBUG) logger.debug('fetch', { params, userDetails }, DEBUG_PREFIX);

    if (!userDetails.profile?.username || !userDetails.read?.appPassword) {
      throw new Error('Missing Bluesky user details');
    }
    await this.agent.login({
      identifier: userDetails.profile.username,
      password: userDetails.read.appPassword,
    });

    let allPosts: BlueskyPost[] = [];
    let newestId: string | undefined;
    let oldestId: string | undefined;
    let cursor: string | undefined;

    const sincePost = params.since_id
      ? await this.getPost(params.since_id, userDetails)
      : undefined;
    const untilPost = params.until_id
      ? await this.getPost(params.until_id, userDetails)
      : undefined;

    while (true) {
      const response = await this.agent.getAuthorFeed({
        actor: userDetails.user_id,
        limit: 100,
        cursor: cursor,
        filter: 'posts_and_author_threads',
      });

      const posts = response.data.feed.map(
        (item) => item.post
      ) as BlueskyPost[];
      if (posts.length === 0) break;

      // Filter posts based on since_id and until_id
      const filteredPosts = posts.filter((post) => {
        const postDate = new Date(post.indexedAt).getTime();
        if (
          sincePost &&
          postDate < new Date(sincePost.value.createdAt).getTime()
        )
          return false;
        if (
          untilPost &&
          postDate > new Date(untilPost.value.createdAt).getTime()
        )
          return false;
        return true;
      });

      allPosts.push(...filteredPosts);

      if (!newestId) newestId = filteredPosts[0]?.uri;
      oldestId = filteredPosts[filteredPosts.length - 1]?.uri;

      const threads = convertBlueskyPostsToThreads(
        allPosts,
        userDetails.user_id
      );

      if (DEBUG)
        logger.debug(
          'fetch iteration',
          {
            postsCount: filteredPosts.length,
            allPostsCount: allPosts.length,
            threadsCount: threads.length,
            newestId,
            oldestId,
          },
          DEBUG_PREFIX
        );

      if (threads.length >= params.expectedAmount || !response.data.cursor) {
        break;
      }

      cursor = response.data.cursor;
    }

    if (allPosts.length === 0) {
      if (DEBUG) logger.debug('fetch no posts found', {}, DEBUG_PREFIX);
      return {
        fetched: {
          newest_id: undefined,
          oldest_id: undefined,
        },
        platformPosts: [],
      };
    }

    const threads = convertBlueskyPostsToThreads(allPosts, userDetails.user_id);

    const platformPosts = threads.map((thread) => ({
      post_id: thread.thread_id,
      user_id: thread.author.did,
      timestampMs: new Date(thread.posts[0].indexedAt).getTime(),
      post: thread,
    }));

    const result = {
      fetched: {
        newest_id: newestId,
        oldest_id: oldestId,
      },
      platformPosts,
    };

    if (DEBUG)
      logger.debug(
        'fetch result',
        {
          newestId,
          oldestId,
          platformPostsCount: platformPosts.length,
        },
        DEBUG_PREFIX
      );

    return result;
  }

  private async getPost(
    postId: string,
    userDetails: BlueskyUserDetails
  ): Promise<
    { uri: string; cid: string; value: AppBskyFeedPost.Record } | undefined
  > {
    const rkey = extractRKeyFromURI(postId);
    if (!rkey) {
      throw new Error('Invalid post ID');
    }
    try {
      this.agent.getPostThread;
      const response = await this.agent.getPost({
        repo: userDetails.user_id,
        rkey,
      });
      return response;
    } catch (error) {
      logger.error('Error fetching post', { postId, error }, DEBUG_PREFIX);
      return undefined;
    }
  }

  public async convertToGeneric(
    platformPost: PlatformPostCreate<any>
  ): Promise<any> {
    // Implement conversion logic here
    throw new Error('Method not implemented.');
  }

  public async publish(
    postPublish: any,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<any>> {
    if (DEBUG) logger.debug('publish', { postPublish }, DEBUG_PREFIX);

    const userDetails = postPublish.userDetails as BlueskyUserDetails;
    if (!userDetails.profile?.username || !userDetails.read?.appPassword) {
      throw new Error('Missing Bluesky user details');
    }
    await this.agent.login({
      identifier: userDetails.profile.username,
      password: userDetails.read.appPassword,
    });

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

    if (!userDetails.profile?.username || !userDetails.read?.appPassword) {
      throw new Error('Missing Bluesky user details');
    }
    await this.agent.login({
      identifier: userDetails.profile.username,
      password: userDetails.read.appPassword,
    });

    const response = await this.agent.getPostThread({ uri: post_id });

    const thread = response.data.thread as AppBskyFeedDefs.ThreadViewPost;
    return {
      post_id: thread.post.uri,
      user_id: thread.post.author.did,
      timestampMs: new Date(thread.post.indexedAt).getTime(),
      post: response.data.thread.post,
    };
  }

  // Implement other required methods here
  public async signDraft(
    post: PlatformPostDraft<string>,
    account: BlueskyUserDetails
  ): Promise<string> {
    return post.unsignedPost || '';
  }
  public async update(
    post: PlatformPostUpdate<string>,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<BlueskyPost>> {
    throw new Error('Method not implemented.');
  }
  public async buildDeleteDraft(
    post_id: string,
    post: AppPostFull,
    author: AppUser
  ): Promise<PlatformPostDeleteDraft | undefined> {
    return undefined;
  }
}
