import AtpAgent, { AppBskyFeedDefs, RichText } from '@atproto/api';

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
    const response = await this.agent.getAuthorFeed({
      actor: userDetails.user_id,
      limit: params.expectedAmount * 2, // Fetch more to account for filtering
      filter: 'posts_and_author_threads',
    });

    const posts = response.data.feed
      .map((item) => ({
        post_id: item.post.uri,
        user_id: item.post.author.did,
        timestampMs: new Date(item.post.indexedAt).getTime(),
        post: item.post,
      }))
      .filter((item) => item.post.author.did === userDetails.user_id);

    const threads = this.extractThreads(posts);

    return {
      fetched: {
        newest_id: threads[0]?.thread_id,
        oldest_id: threads[threads.length - 1]?.thread_id,
      },
      platformPosts: threads.map((thread) => ({
        post_id: thread.thread_id,
        user_id: thread.author.did,
        timestampMs: new Date(thread.posts[0].indexedAt).getTime(),
        post: thread,
      })),
    };
  }

  private extractThreads(posts: any[]): BlueskyThread[] {
    const rootPosts = posts.filter((post) => !post.post.record.reply);

    return rootPosts.map((rootPost) => this.buildThread(rootPost, posts));
  }

  private buildThread(rootPost: any, allPosts: any[]): BlueskyThread {
    const thread: any[] = [rootPost.post];
    let currentPost = rootPost;

    while (true) {
      const children = allPosts.filter(
        (post) =>
          post.post.record.reply &&
          post.post.record.reply.parent.uri === currentPost.post.uri
      );

      if (children.length === 0) break;

      const earliestChild = children.reduce((earliest, current) =>
        new Date(current.post.record.createdAt) <
        new Date(earliest.post.record.createdAt)
          ? current
          : earliest
      );

      thread.push(earliestChild.post);
      currentPost = earliestChild;
    }

    return {
      thread_id: rootPost.post.uri,
      posts: thread,
      author: rootPost.post.author,
    };
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
