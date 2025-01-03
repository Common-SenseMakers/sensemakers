import AtpAgent, {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  RichText,
} from '@atproto/api';
import * as jwt from 'jsonwebtoken';

import {
  AccessJwtPayload,
  BlueskyAccountCredentials,
  BlueskyAccountDetails,
  BlueskyCredentials,
  BlueskyPost,
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
import {
  PlatformAccountProfile,
  PlatformProfile,
} from '../../@shared/types/types.profiles';
import { parseBlueskyURI } from '../../@shared/utils/bluesky.utils';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService, WithCredentials } from '../platforms.interface';
import {
  cleanBlueskyContent,
  convertBlueskyPostsToThreads,
  extractPrimaryThread,
  removeUndefinedFields,
} from './bluesky.utils';

const DEBUG = false;
const DEBUG_PREFIX = 'BlueskyService';

export interface BlueskyServiceConfig {
  BLUESKY_SERVICE_URL: string;
  BLUESKY_USERNAME: string;
  BLUESKY_APP_PASSWORD: string;
}

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
    protected usersRepo: UsersRepository,
    protected config: BlueskyServiceConfig,
    protected agent?: AtpAgent
  ) {}

  private async getClient(
    credentials?: BlueskyCredentials
  ): Promise<{ client: AtpAgent; credentials?: BlueskyCredentials }> {
    const session = await (async () => {
      if (!this.agent) {
        this.agent = new AtpAgent({
          service: this.config.BLUESKY_SERVICE_URL,
        });
      }
      if (!credentials) {
        if (this.agent?.session) {
          return this.agent.session;
        }
        await this.agent.login({
          identifier: this.config.BLUESKY_USERNAME,
          password: this.config.BLUESKY_APP_PASSWORD,
        });
        if (!this.agent.session) {
          throw new Error('Failed to login to Bluesky');
        }
        return this.agent.session;
      }
      return credentials;
    })();
    if (!this.agent) {
      throw new Error('Failed to initialize bluesky client');
    }
    await this.agent.resumeSession(session);
    if (!this.agent.session) {
      throw new Error('Failed to initiate bluesky session');
    }
    const decodedAccessJwt = jwt.decode(
      this.agent.session.accessJwt
    ) as AccessJwtPayload;

    let newCredentials: BlueskyCredentials | undefined = undefined;

    /** if the access token is under 1 hour from expiring, refresh it */
    if (decodedAccessJwt.exp * 1000 - this.time.now() < 1000 * 60 * 60) {
      await this.agent.sessionManager.refreshSession();
      newCredentials = this.agent.session;
    }

    return { client: this.agent, credentials: newCredentials };
  }

  public async getSignupContext(userId?: string, params?: any): Promise<any> {
    // Bluesky doesn't require a signup context when using app password
    return {};
  }

  public async handleSignupData(signupData: BlueskySignupData) {
    if (DEBUG) logger.debug('handleSignupData', { signupData }, DEBUG_PREFIX);
    const agent = new AtpAgent({ service: this.config.BLUESKY_SERVICE_URL });
    await agent.login({
      identifier: signupData.username,
      password: signupData.appPassword,
    });
    if (!agent.session) {
      throw new Error('Failed to login to Bluesky');
    }
    const bskFullUser = await agent.getProfile({
      actor: agent.session.did,
    });

    const sessionData = removeUndefinedFields(agent.session);
    const bluesky: BlueskyAccountDetails = {
      user_id: bskFullUser.data.did,
      signupDate: this.time.now(),
      credentials: {
        read: sessionData,
      },
    };

    const bskSimpleUser: PlatformProfile = {
      id: bskFullUser.data.did,
      username: bskFullUser.data.handle,
      displayName: bskFullUser.data.displayName || bskFullUser.data.handle,
      avatar: bskFullUser.data.avatar || '',
      description: bskFullUser.data.description || '',
    };

    const profile: PlatformAccountProfile = {
      user_id: bskSimpleUser.id,
      profile: bskSimpleUser,
    };

    if (signupData.type === 'write') {
      bluesky.credentials['write'] = sessionData;
    }

    if (DEBUG)
      logger.debug('handleSignupData result', { bluesky }, DEBUG_PREFIX);

    return { accountDetails: bluesky, profile };
  }

  public async getProfileByUsername(
    username: string,
    credentials?: BlueskyCredentials
  ): Promise<PlatformAccountProfile<PlatformProfile> | undefined> {
    try {
      const { client: agent } = await this.getClient(credentials);
      const profile = await agent.getProfile({ actor: username });

      if (profile.success) {
        return {
          user_id: profile.data.did,
          profile: {
            id: profile.data.did,
            username: profile.data.handle,
            displayName: profile.data.displayName || profile.data.handle,
            avatar: profile.data.avatar || '',
            description: profile.data.description || '',
          },
        };
      }
      throw new Error(`${profile.data}`);
    } catch (e: any) {
      throw new Error(
        `Error getting Bluesky account by username: ${e.message}`
      );
    }
  }

  public async fetch(
    user_id: string,
    params: PlatformFetchParams,
    credentials?: BlueskyAccountCredentials
  ): Promise<FetchedResult<BlueskyThread>> {
    if (DEBUG)
      logger.debug('fetch', { user_id, params, credentials }, DEBUG_PREFIX);

    const { client: agent, credentials: newCredentials } = await this.getClient(
      credentials?.read
    );
    const newAccountCredentials: BlueskyAccountCredentials | undefined =
      newCredentials ? { read: newCredentials } : undefined;

    if (newAccountCredentials && credentials?.write) {
      newAccountCredentials.write = newCredentials;
    }

    let allPosts: BlueskyPost[] = [];
    let newestId: string | undefined;
    let oldestId: string | undefined;
    let cursor: string | undefined;

    const sincePost = params.since_id
      ? await this.getPost(params.since_id, credentials?.read)
      : undefined;
    const untilPost = params.until_id
      ? await this.getPost(params.until_id, credentials?.read)
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

    const platformPosts = threads.map((thread) => ({
      post_id: thread.thread_id,
      user_id: thread.author.id,
      timestampMs: new Date(thread.posts[0].record.createdAt).getTime(),
      post: thread,
    }));

    const result = {
      fetched: {
        newest_id: newestId,
        oldest_id: oldestId,
      },
      platformPosts,
      credentials: newAccountCredentials,
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
    credentials?: BlueskyCredentials
  ): Promise<
    { uri: string; cid: string; value: AppBskyFeedPost.Record } | undefined
  > {
    const { client: agent } = await this.getClient(credentials);
    const { did, rkey } = parseBlueskyURI(postId);
    if (!rkey) {
      throw new Error('Invalid post ID');
    }
    try {
      const response = await agent.getPost({
        repo: did,
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
      avatarUrl: thread.author.avatar,
    };

    const genericPosts: GenericPost[] = thread.posts.map((post) => {
      const genericPost: GenericPost = {
        url: `https://bsky.app/profile/${post.author.handle}/post/${parseBlueskyURI(post.uri).rkey}`,
        content: cleanBlueskyContent(post.record),
      };

      try {
        if (
          post.embed &&
          (post.embed.$type === 'app.bsky.embed.record#view' ||
            post.embed.$type === 'app.bsky.embed.recordWithMedia#view')
        ) {
          const quotedPost = (() => {
            if (post.embed.$type === 'app.bsky.embed.record#view') {
              return post.embed.record as QuotedBlueskyPost;
            }
            return post.embed.record.record as QuotedBlueskyPost;
          })();

          post.embed.record as QuotedBlueskyPost;
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
                  url: `https://bsky.app/profile/${quotedPost.author.handle}/post/${parseBlueskyURI(quotedPost.uri).rkey}`,
                  content: cleanBlueskyContent(quotedPost.value),
                },
              ],
            };
          }
        }
      } catch (e) {
        logger.warn(
          `Error parsing quoted post in post ${post.id}. Excluding from generic post`,
          { postId: post.id, error: e },
          DEBUG_PREFIX
        );
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
  ) {
    if (DEBUG) logger.debug('publish', { postPublish }, DEBUG_PREFIX);

    const userDetails = postPublish.credentials;
    if (!userDetails.write) throw new Error('Missing Bluesky user details');
    const { client: agent, credentials: newCredentials } = await this.getClient(
      userDetails.write
    );
    const newAccountCredentials: BlueskyAccountCredentials | undefined =
      newCredentials ? { read: newCredentials } : undefined;

    if (newAccountCredentials && userDetails.write) {
      newAccountCredentials.write = newCredentials;
    }

    const rt = new RichText({ text: postPublish.draft });
    await rt.detectFacets(agent);

    const response = await agent.post({
      text: rt.text,
      facets: rt.facets,
    });

    return {
      platformPost: {
        post_id: response.uri,
        user_id: agent.session?.did!,
        timestampMs: Date.now(),
        post: response,
      },
      credentials: newAccountCredentials,
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

  public async getProfile(
    user_id: string,
    credentials: any
  ): Promise<PlatformAccountProfile | undefined> {
    try {
      if (!credentials) {
        throw new Error('Missing Bluesky user details');
      }
      const { client: agent } = await this.getClient(credentials);
      const profile = await agent.getProfile({ actor: user_id });

      if (profile.success) {
        return {
          user_id: profile.data.did,
          profile: {
            id: profile.data.did,
            username: profile.data.handle,
            displayName: profile.data.displayName || profile.data.handle,
            avatar: profile.data.avatar || '',
          },
        };
      }
      throw new Error(`${profile.data}`);
    } catch (e: any) {
      throw new Error(`Error fetching Bluesky account: ${e.message}`);
    }
  }

  public async get(
    post_id: string,
    credentials: BlueskyAccountCredentials
  ): Promise<
    { platformPost: PlatformPostPosted<BlueskyThread> } & WithCredentials
  > {
    if (DEBUG) logger.debug('get', { post_id, credentials }, DEBUG_PREFIX);

    if (!credentials.read) {
      throw new Error('Missing Bluesky user details');
    }
    const { client: agent, credentials: newCredentials } = await this.getClient(
      credentials.read
    );
    const newAccountCredentials: BlueskyAccountCredentials | undefined =
      newCredentials ? { read: newCredentials } : undefined;

    if (newAccountCredentials && credentials?.write) {
      newAccountCredentials.write = newCredentials;
    }

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

    return { platformPost, credentials: newAccountCredentials };
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
