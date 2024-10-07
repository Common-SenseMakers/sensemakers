import AtpAgent, {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  AtpSessionData,
  CredentialSession,
  RichText,
} from '@atproto/api';

import {
  BlueskyAccountCredentials,
  BlueskyAccountDetails,
  BlueskyCredentials,
  BlueskyPost,
  BlueskyProfile,
  BlueskySignupContext,
  BlueskySignupData,
  BlueskyThread,
  QuotedBlueskyPost,
} from '../../@shared/types/types.bluesky';
import { PlatformFetchParams } from '../../@shared/types/types.fetch';
import {
  FetchedResult,
  PlatformPostCreate,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostPosted,
  PlatformPostPublish,
  PlatformPostSignerType,
} from '../../@shared/types/types.platform.posts';
import { PLATFORM } from '../../@shared/types/types.platforms';
import {
  GenericAuthor,
  GenericPost,
  GenericThread,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';
import {
  cleanBlueskyContent,
  convertBlueskyPostsToThreads,
  extractPrimaryThread,
  extractRKeyFromURI,
  removeUndefinedFields,
} from './bluesky.utils';

const DEBUG = true;
const DEBUG_PREFIX = 'BlueskyService';

export class BlueskyService
  implements
    PlatformService<
      BlueskySignupContext,
      BlueskySignupData,
      BlueskyAccountDetails
    >
{
  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository
  ) {}

  private getAuthenticatedAtpAgent(session: AtpSessionData): AtpAgent {
    const credentialSession = new CredentialSession(
      new URL('https://bsky.social'),
      fetch
    );
    credentialSession.session = session;

    return new AtpAgent(credentialSession);
  }

  public async getSignupContext(userId?: string, params?: any): Promise<any> {
    // Bluesky doesn't require a signup context when using app password
    return {};
  }

  public async handleSignupData(signupData: BlueskySignupData): Promise<{
    accountDetails: BlueskyAccountDetails;
    profile: BlueskyProfile;
  }> {
    if (DEBUG) logger.debug('handleSignupData', { signupData }, DEBUG_PREFIX);

    const agent = new AtpAgent({ service: 'https://bsky.social' });
    await agent.login({
      identifier: signupData.username,
      password: signupData.appPassword,
    });
    if (!agent.session) {
      throw new Error('Failed to login to Bluesky');
    }
    const sessionData = removeUndefinedFields(agent.session);

    const bskProfile = await agent.getProfile({
      actor: sessionData.did,
    });

    const bluesky: BlueskyAccountDetails = {
      user_id: bskProfile.data.did,
      signupDate: this.time.now(),
      credentials: { read: sessionData },
    };

    const profile: BlueskyProfile = {
      id: bskProfile.data.did,
      username: bskProfile.data.handle,
      displayName: bskProfile.data.displayName || bskProfile.data.handle,
      avatar: bskProfile.data.avatar || '',
    };

    if (signupData.type === 'write') {
      bluesky.credentials['write'] = sessionData;
    }

    if (DEBUG)
      logger.debug('handleSignupData result', { bluesky }, DEBUG_PREFIX);

    return { accountDetails: bluesky, profile };
  }

  public async fetch(
    user_id: string,
    params: PlatformFetchParams,
    credentials: BlueskyAccountCredentials
  ): Promise<FetchedResult<BlueskyThread>> {
    if (DEBUG)
      logger.debug('fetch', { user_id, params, credentials }, DEBUG_PREFIX);

    if (!credentials.read) {
      throw new Error('Missing Bluesky user details');
    }

    const agent = this.getAuthenticatedAtpAgent(credentials.read);

    let allPosts: BlueskyPost[] = [];
    let newestId: string | undefined;
    let oldestId: string | undefined;
    let cursor: string | undefined;

    const sincePost = params.since_id
      ? await this.getPost(params.since_id, credentials.read)
      : undefined;
    const untilPost = params.until_id
      ? await this.getPost(params.until_id, credentials.read)
      : undefined;

    // If until_id is provided, use its createdAt as the initial cursor
    if (untilPost) {
      cursor = new Date(untilPost.value.createdAt).toISOString();
    }

    let shouldBreak = false;
    while (!shouldBreak) {
      const response = await agent.getAuthorFeed({
        actor: user_id,
        limit: 40,
        cursor: cursor,
        filter: 'posts_and_author_threads',
      });

      const posts = response.data.feed
        .map((item) => item.post)
        .filter((post) => post.author.did === user_id) as BlueskyPost[];
      if (posts.length === 0) break;

      allPosts.push(...posts);

      if (!newestId) newestId = posts[0]?.uri;
      oldestId = posts[posts.length - 1]?.uri;

      const threads = convertBlueskyPostsToThreads(allPosts, user_id);

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
          (post) => new Date(post.record.createdAt).getTime() <= sinceDate
        );
        if (hasOlderPost || !response.data.cursor) {
          shouldBreak = true;
        }
      }

      cursor = response.data.cursor;
    }

    // Filter posts based on since_id and until_id
    allPosts = allPosts.filter((post) => {
      const postDate = new Date(post.record.createdAt).getTime();
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

    const threads = convertBlueskyPostsToThreads(allPosts, user_id);

    console.error('TODO: implement DID');

    const platformPosts = threads.map((thread) => ({
      post_id: thread.thread_id,
      user_id: 'placeholder',
      timestampMs: new Date(thread.posts[0].record.createdAt).getTime(),
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
    credentials: BlueskyCredentials
  ): Promise<
    { uri: string; cid: string; value: AppBskyFeedPost.Record } | undefined
  > {
    const agent = this.getAuthenticatedAtpAgent(credentials);
    const rkey = extractRKeyFromURI(postId);
    if (!rkey) {
      throw new Error('Invalid post ID');
    }
    try {
      console.error('TODO: implement repo');
      const repo = 'placeholder';
      const response = await agent.getPost({
        repo,
        rkey,
      });
      return response;
    } catch (error) {
      logger.error('Error fetching post', { postId, error }, DEBUG_PREFIX);
      return undefined;
    }
  }

  public async convertToGeneric(
    platformPost: PlatformPostCreate<BlueskyThread>
  ): Promise<GenericThread> {
    if (!platformPost.posted) {
      throw new Error('Unexpected undefined posted');
    }

    const thread = platformPost.posted.post;

    const genericAuthor: GenericAuthor = {
      platformId: PLATFORM.Bluesky,
      id: thread.author.id,
      username: thread.author.username,
      name: thread.author.displayName || thread.author.username,
    };

    const genericPosts: GenericPost[] = thread.posts.map((post) => {
      const genericPost: GenericPost = {
        url: `https://bsky.app/profile/${post.author.handle}/post/${extractRKeyFromURI(post.uri)}`,
        content: cleanBlueskyContent(post.record),
      };

      if (post.embed && post.embed.$type === 'app.bsky.embed.record#view') {
        const quotedPost = post.embed.record as QuotedBlueskyPost;
        if (quotedPost.$type === 'app.bsky.embed.record#viewRecord') {
          genericPost.quotedThread = {
            author: {
              platformId: PLATFORM.Bluesky,
              id: quotedPost.author.did,
              username: quotedPost.author.handle,
              name: quotedPost.author.displayName || quotedPost.author.handle,
            },
            thread: [
              {
                url: `https://bsky.app/profile/${quotedPost.author.handle}/post/${extractRKeyFromURI(quotedPost.uri)}`,
                content: cleanBlueskyContent(quotedPost.value),
              },
            ],
          };
        }
      }

      return genericPost;
    });

    return {
      author: genericAuthor,
      thread: genericPosts,
    };
  }

  public async publish(
    postPublish: PlatformPostPublish<string, BlueskyCredentials>
  ): Promise<PlatformPostPosted<any>> {
    if (DEBUG) logger.debug('publish', { postPublish }, DEBUG_PREFIX);

    const userDetails = postPublish.credentials;
    if (!userDetails.read) throw new Error('Missing Bluesky user details');
    const agent = this.getAuthenticatedAtpAgent(userDetails.read);

    const rt = new RichText({ text: postPublish.draft });
    await rt.detectFacets(agent);

    const response = await agent.post({
      text: rt.text,
      facets: rt.facets,
    });

    return {
      post_id: response.uri,
      user_id: agent.session?.did!,
      timestampMs: Date.now(),
      post: response,
    };
  }

  public async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<string>> {
    const account = UsersHelper.getProfile(
      postAndAuthor.author,
      PLATFORM.Bluesky,
      undefined,
      true
    );

    const content = postAndAuthor.post.generic.thread
      .map((post) => post.content)
      .join('\n\n');

    // Bluesky has a character limit of 300
    const truncatedContent = content.slice(0, 300);

    return {
      user_id: account.user_id,
      signerType: PlatformPostSignerType.DELEGATED,
      postApproval: PlatformPostDraftApproval.PENDING,
      unsignedPost: truncatedContent,
    };
  }

  public async get(
    post_id: string,
    credentials: BlueskyAccountCredentials
  ): Promise<{ platformPost: PlatformPostPosted<BlueskyThread> }> {
    if (DEBUG) logger.debug('get', { post_id, credentials }, DEBUG_PREFIX);

    if (!credentials.read) {
      throw new Error('Missing Bluesky user details');
    }
    const agent = this.getAuthenticatedAtpAgent(credentials.read);

    const response = await agent.getPostThread({
      uri: post_id,
      depth: 100,
      parentHeight: 100,
    });

    if (response.data.thread.$type !== 'app.bsky.feed.defs#threadViewPost') {
      throw new Error('Unexpected thread type');
    }

    const threadViewPost = response.data
      .thread as AppBskyFeedDefs.ThreadViewPost;
    const rootPost = this.findRootPost(threadViewPost);

    // If the initial post is not the root, fetch the root thread
    const rootResponse =
      rootPost.post.uri !== post_id
        ? await agent.getPostThread({
            uri: rootPost.post.uri,
            depth: 100,
            parentHeight: 100,
          })
        : response;

    if (
      rootResponse.data.thread.$type !== 'app.bsky.feed.defs#threadViewPost'
    ) {
      throw new Error('Unexpected root thread type');
    }

    const rootThreadViewPost = rootResponse.data
      .thread as AppBskyFeedDefs.ThreadViewPost;

    const allPosts = this.collectAllPosts(rootThreadViewPost);
    const mainThread = extractPrimaryThread(
      rootThreadViewPost.post.uri,
      allPosts
    );

    const bskAuthor = rootThreadViewPost.post.author;

    const blueskyThread: BlueskyThread = {
      thread_id: rootThreadViewPost.post.uri,
      posts: mainThread,
      author: {
        id: bskAuthor.did,
        username: bskAuthor.handle,
        avatar: bskAuthor.avatar || '',
        displayName: bskAuthor.displayName || bskAuthor.handle,
      },
    };

    const platformPost = {
      post_id: blueskyThread.thread_id,
      user_id: blueskyThread.author.id,
      timestampMs: new Date(blueskyThread.posts[0].record.createdAt).getTime(),
      post: blueskyThread,
    };

    return { platformPost };
  }

  private findRootPost(
    thread: AppBskyFeedDefs.ThreadViewPost
  ): AppBskyFeedDefs.ThreadViewPost {
    if (
      !thread.parent ||
      thread.parent.$type !== 'app.bsky.feed.defs#threadViewPost'
    ) {
      return thread;
    }
    return this.findRootPost(thread.parent as AppBskyFeedDefs.ThreadViewPost);
  }

  private collectAllPosts(
    thread: AppBskyFeedDefs.ThreadViewPost
  ): BlueskyPost[] {
    const posts: BlueskyPost[] = [
      {
        ...thread.post,
        record: thread.post.record as AppBskyFeedPost.Record,
      } as BlueskyPost,
    ];
    if (thread.replies) {
      for (const reply of thread.replies) {
        if (reply.$type === 'app.bsky.feed.defs#threadViewPost') {
          posts.push(
            ...this.collectAllPosts(reply as AppBskyFeedDefs.ThreadViewPost)
          );
        }
      }
    }
    return posts;
  }
}
