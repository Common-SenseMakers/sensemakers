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
  extractPrimaryThread,
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

    // If until_id is provided, use its createdAt as the initial cursor
    if (untilPost) {
      cursor = new Date(untilPost.value.createdAt).toISOString();
    }

    let shouldBreak = false;
    while (!shouldBreak) {
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

      allPosts.push(...posts);

      if (!newestId) newestId = posts[0]?.uri;
      oldestId = posts[posts.length - 1]?.uri;

      const threads = convertBlueskyPostsToThreads(
        allPosts,
        userDetails.user_id
      );

      if (DEBUG)
        logger.debug(
          'fetch iteration',
          {
            postsCount: posts.length,
            allPostsCount: allPosts.length,
            threadsCount: threads.length,
            newestId,
            oldestId,
          },
          DEBUG_PREFIX
        );

      // Case 1: No since_id or until_id
      if (!params.since_id && !params.until_id) {
        if (threads.length >= params.expectedAmount || !response.data.cursor) {
          shouldBreak = true;
        }
      }
      // Case 2: until_id is provided
      else if (params.until_id) {
        if (threads.length >= params.expectedAmount || !response.data.cursor) {
          shouldBreak = true;
        }
      }
      // Case 3: since_id is provided
      else if (params.since_id) {
        const sinceDate = sincePost
          ? new Date(sincePost.value.createdAt).getTime()
          : Infinity;
        const hasOlderPost = posts.some(
          (post) => new Date(post.indexedAt).getTime() <= sinceDate
        );
        if (hasOlderPost || !response.data.cursor) {
          shouldBreak = true;
        }
      }

      cursor = response.data.cursor;
    }

    // Filter posts based on since_id and until_id
    allPosts = allPosts.filter((post) => {
      const postDate = new Date(post.indexedAt).getTime();
      if (
        sincePost &&
        postDate <= new Date(sincePost.value.createdAt).getTime()
      )
        return false;
      if (
        untilPost &&
        postDate >= new Date(untilPost.value.createdAt).getTime()
      )
        return false;
      return true;
    });

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
  ): Promise<PlatformPostPosted<BlueskyThread>> {
    if (DEBUG) logger.debug('get', { post_id, userDetails }, DEBUG_PREFIX);

    if (!userDetails.profile?.username || !userDetails.read?.appPassword) {
      throw new Error('Missing Bluesky user details');
    }
    await this.agent.login({
      identifier: userDetails.profile.username,
      password: userDetails.read.appPassword,
    });

    const response = await this.agent.getPostThread({ uri: post_id, depth: 100, parentHeight: 100 });

    if (response.data.thread.$type !== 'app.bsky.feed.defs#threadViewPost') {
      throw new Error('Unexpected thread type');
    }

    const threadViewPost = response.data.thread as AppBskyFeedDefs.ThreadViewPost;
    const rootPost = this.findRootPost(threadViewPost);

    // If the initial post is not the root, fetch the root thread
    const rootResponse = rootPost.post.uri !== post_id
      ? await this.agent.getPostThread({ uri: rootPost.post.uri, depth: 100, parentHeight: 100 })
      : response;

    if (rootResponse.data.thread.$type !== 'app.bsky.feed.defs#threadViewPost') {
      throw new Error('Unexpected root thread type');
    }

    const rootThreadViewPost = rootResponse.data.thread as AppBskyFeedDefs.ThreadViewPost;
    const allPosts = this.collectAllPosts(rootThreadViewPost);
    const mainThread = extractPrimaryThread(rootThreadViewPost.post.uri, allPosts);

    const blueskyThread: BlueskyThread = {
      thread_id: rootThreadViewPost.post.uri,
      posts: mainThread,
      author: rootThreadViewPost.post.author,
    };

    return {
      post_id: blueskyThread.thread_id,
      user_id: blueskyThread.author.did,
      timestampMs: new Date(blueskyThread.posts[0].indexedAt).getTime(),
      post: blueskyThread,
    };
  }

  private findRootPost(thread: AppBskyFeedDefs.ThreadViewPost): AppBskyFeedDefs.ThreadViewPost {
    if (!thread.parent || thread.parent.$type !== 'app.bsky.feed.defs#threadViewPost') {
      return thread;
    }
    return this.findRootPost(thread.parent as AppBskyFeedDefs.ThreadViewPost);
  }

  private collectAllPosts(thread: AppBskyFeedDefs.ThreadViewPost): BlueskyPost[] {
    const posts: BlueskyPost[] = [{
      ...thread.post,
      record: thread.post.record as AppBskyFeedPost.Record
    }];
    if (thread.replies) {
      for (const reply of thread.replies) {
        if (reply.$type === 'app.bsky.feed.defs#threadViewPost') {
          posts.push(...this.collectAllPosts(reply as AppBskyFeedDefs.ThreadViewPost));
        }
      }
    }
    return posts;
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
