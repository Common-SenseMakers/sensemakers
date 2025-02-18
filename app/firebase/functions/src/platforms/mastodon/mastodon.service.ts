import { createOAuthAPIClient, createRestAPIClient, mastodon } from 'masto';

import { PlatformFetchParams } from '../../@shared/types/types.fetch';
import {
  MastodonAccountCredentials,
  MastodonAccountDetails,
  MastodonGetContextParams,
  MastodonPost,
  MastodonSignupContext,
  MastodonSignupData,
  MastodonThread,
} from '../../@shared/types/types.mastodon';
import {
  FetchedResult,
  PlatformPost,
  PlatformPostCreate,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostPosted,
  PlatformPostPublish,
  PlatformPostSignerType,
} from '../../@shared/types/types.platform.posts';
import {
  PLATFORM,
  PlatformSessionRefreshError,
} from '../../@shared/types/types.platforms';
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
import { AccountCredentials } from '../../@shared/types/types.user';
import {
  buildMastodonPostUri,
  getGlobalMastodonUsername,
  parseMastodonAccountURI,
  parseMastodonGlobalUsername,
  parseMastodonPostURI,
} from '../../@shared/utils/mastodon.utils';
import { APP_NAME } from '../../config/config.runtime';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService, WithCredentials } from '../platforms.interface';
import {
  cleanMastodonContent,
  convertMastodonPostsToThreads,
  extractPrimaryThread,
} from './mastodon.utils';

const DEBUG = false;
const DEBUG_PREFIX = 'MastodonService';

export interface MastodonServiceConfig {
  accessTokens: Record<string, string>; // access token per server
}

export class MastodonService
  implements
    PlatformService<
      MastodonSignupContext,
      MastodonSignupData,
      MastodonAccountDetails
    >
{
  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository,
    protected config: MastodonServiceConfig
  ) {}

  protected async createApp(params: MastodonGetContextParams) {
    if (DEBUG) logger.debug('createApp', { params }, DEBUG_PREFIX);

    const client = createRestAPIClient({
      url: `https://${params.mastodonServer}`,
    });

    const scopes = params.type === 'write' ? 'read write' : 'read';

    const app = await client.v1.apps.create({
      clientName: APP_NAME,
      redirectUris: params.callback_url,
      scopes,
      website: `https://${params.mastodonServer}`,
    });

    if (DEBUG) logger.debug('createApp result', { app }, DEBUG_PREFIX);

    return app;
  }

  public async getClient(
    server: string,
    credentials?: MastodonAccountCredentials
  ) {
    try {
      const accessTokenServer = this.config.accessTokens[server]
        ? server
        : 'mastodon.social';
      const client = createRestAPIClient({
        url: `https://${server}`,
        accessToken: credentials
          ? credentials.accessToken
          : this.config.accessTokens[accessTokenServer],
      });
      return client;
    } catch (e: any) {
      throw new PlatformSessionRefreshError(e);
    }
  }

  public async getSignupContext(
    params?: MastodonGetContextParams
  ): Promise<MastodonSignupContext> {
    if (DEBUG) logger.debug('getSignupContext', { params }, DEBUG_PREFIX);

    if (!params || !params.mastodonServer || !params.callback_url) {
      throw new Error('Mastodon server and callback URL are required');
    }

    const app = await this.createApp(params);
    if (!app.clientId || !app.clientSecret) {
      throw new Error('Failed to create Mastodon app');
    }

    const scopes = params.type === 'write' ? 'read+write' : 'read';

    const authorizationUrl =
      `https://${params.mastodonServer}/oauth/authorize?` +
      `client_id=${app.clientId}&` +
      `scope=${scopes}&` +
      `redirect_uri=${params.callback_url}&` +
      `response_type=code`;

    const result = {
      authorizationUrl,
      clientId: app.clientId,
      clientSecret: app.clientSecret,
    };

    if (DEBUG) logger.debug('getSignupContext result', result, DEBUG_PREFIX);

    return result;
  }

  public async handleSignupData(signupData: MastodonSignupData) {
    const token = await (async () => {
      if ('accessToken' in signupData) {
        return { accessToken: signupData.accessToken };
      }
      const client = createOAuthAPIClient({
        url: `https://${signupData.mastodonServer}`,
      });
      return await client.token.create({
        clientId: signupData.clientId,
        clientSecret: signupData.clientSecret,
        redirectUri: signupData.callback_url,
        code: signupData.code,
        grantType: 'authorization_code',
      });
    })();

    if (DEBUG) logger.debug('handleSignupData token', { token }, DEBUG_PREFIX);

    const mastoClient = await this.getClient(signupData.mastodonServer, {
      server: signupData.mastodonServer,
      accessToken: token.accessToken,
    });

    const account = await mastoClient.v1.accounts.verifyCredentials();
    const credentials: MastodonAccountCredentials = {
      accessToken: token.accessToken,
      server: signupData.mastodonServer,
    };

    const mastodon: MastodonAccountDetails = {
      user_id: parseMastodonAccountURI(account.url).globalUsername,
      signupDate: this.time.now(),
      credentials: {
        read: credentials,
      },
    };
    if (signupData.type === 'write') {
      mastodon.credentials['write'] = credentials;
    }

    if (DEBUG)
      logger.debug('handleSignupData result', { mastodon }, DEBUG_PREFIX);

    const mdProfile: PlatformProfile = {
      id: account.id,
      username: getGlobalMastodonUsername(
        account.username,
        signupData.mastodonServer
      ),
      displayName: account.displayName,
      avatar: account.avatar,
      description: account.note,
    };

    const profile: PlatformAccountProfile = {
      user_id: parseMastodonAccountURI(account.url).globalUsername,
      profile: mdProfile,
    };

    return { accountDetails: mastodon, profile };
  }

  public async fetch(
    user_id: string,
    params: PlatformFetchParams,
    credentials?: AccountCredentials<
      MastodonAccountCredentials,
      MastodonAccountCredentials
    >
  ): Promise<FetchedResult<MastodonThread>> {
    if (DEBUG) logger.debug('fetch', { params, credentials }, DEBUG_PREFIX);
    const { server, localUsername } = parseMastodonGlobalUsername(user_id);
    const client = await this.getClient(server, credentials?.read);

    const account = await client.v1.accounts.lookup({
      acct: localUsername,
    });

    const fetchParams: any = {
      limit: 40, // Default limit
      excludeReplies: true,
      excludeReblogs: true,
    };

    if (params.since_id) {
      fetchParams.minId = parseMastodonPostURI(params.since_id).postId;
    }
    if (params.until_id) {
      fetchParams.maxId = parseMastodonPostURI(params.until_id).postId;
    }

    if (DEBUG)
      logger.debug('fetch params', { user_id, fetchParams }, DEBUG_PREFIX);

    const paginator = client.v1.accounts
      .$select(account.id)
      .statuses.list(fetchParams);

    let allStatuses: MastodonPost[] = [];
    let newestId: string | undefined;
    let oldestId: string | undefined;

    while (true) {
      const result = await paginator.next();
      if (result.done) break;

      const _statuses = result.value;
      if (_statuses.length === 0) break;

      /** filter out anything that isn't public */
      const statuses = _statuses.filter(
        (status) => status.visibility === 'public'
      );

      allStatuses.push(...statuses);

      const sortedStatuses = statuses.sort(
        (a, b) => Number(b.id) - Number(a.id)
      );

      if (!newestId) newestId = sortedStatuses[0].uri;
      newestId =
        sortedStatuses[0].id > parseMastodonPostURI(newestId).postId
          ? sortedStatuses[0].uri
          : newestId;
      if (!oldestId) oldestId = sortedStatuses[sortedStatuses.length - 1].uri;
      oldestId =
        sortedStatuses[sortedStatuses.length - 1].id <
        parseMastodonPostURI(oldestId).postId
          ? sortedStatuses[sortedStatuses.length - 1].uri
          : oldestId;

      const threads = convertMastodonPostsToThreads(
        allStatuses,
        allStatuses[0].account
      );

      if (DEBUG)
        logger.debug(
          'fetch iteration',
          {
            statusesCount: statuses.length,
            allStatusesCount: allStatuses.length,
            threadsCount: threads.length,
            newestId,
            oldestId,
          },
          DEBUG_PREFIX
        );

      if (threads.length >= params.expectedAmount) {
        break;
      }
    }
    if (allStatuses.length === 0) {
      if (DEBUG) logger.debug('fetch no statuses found', {}, DEBUG_PREFIX);
      return {
        fetched: {
          newest_id: undefined,
          oldest_id: undefined,
        },
        platformPosts: [],
      };
    }

    const threads = convertMastodonPostsToThreads(
      allStatuses,
      allStatuses[0].account
    );

    const platformPosts = await Promise.all(
      threads.map(async (thread) => {
        const rootPostId = await this.getRootPostId(
          thread.posts[0],
          credentials
        );
        return {
          post_id: rootPostId,
          user_id,
          timestampMs: new Date(thread.posts[0].createdAt).getTime(),
          post: {
            ...thread,
            thread_id: rootPostId,
          },
        };
      })
    );

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

  public async convertToGeneric(
    platformPost: PlatformPostCreate<MastodonThread>
  ): Promise<GenericThread> {
    if (!platformPost.posted) {
      throw new Error('Unexpected undefined posted');
    }

    const thread = platformPost.posted.post;
    const { globalUsername } = parseMastodonAccountURI(thread.author.url);
    const genericAuthor: GenericAuthor = {
      platformId: PLATFORM.Mastodon,
      id: thread.author.id,
      username: globalUsername,
      name: thread.author.displayName,
      avatarUrl: thread.author.avatar,
    };

    const genericPosts: GenericPost[] = thread.posts.map((status) => {
      if (status.reblog) {
        return {
          content: cleanMastodonContent(status.content),
          quotedThread: {
            author: {
              platformId: PLATFORM.Mastodon,
              id: status.reblog.account.id,
              username: parseMastodonAccountURI(status.reblog.account.url)
                .globalUsername,
              name: status.reblog.account.displayName,
              avatarUrl: status.reblog.account.avatar,
            },
            thread: [
              {
                url: status.reblog.url || undefined,
                content: cleanMastodonContent(status.reblog.content),
              },
            ],
          },
        };
      }
      return {
        url: status.url ? status.url : undefined,
        content: cleanMastodonContent(status.content),
      };
    });

    return {
      author: genericAuthor,
      thread: genericPosts,
    };
  }

  public async publish(
    postPublish: PlatformPostPublish<string, MastodonAccountCredentials>
  ): Promise<{ platformPost: PlatformPostPosted<mastodon.v1.Status> }> {
    const credentials = postPublish.credentials;

    if (!credentials.write) {
      throw new Error('write credentials are not provided');
    }
    const client = createRestAPIClient({
      url: `https://${credentials.write.server}`,
      accessToken: credentials.write.accessToken,
    });

    const status = await client.v1.statuses.create({
      status: postPublish.draft,
    });

    const post = {
      post_id: status.uri,
      user_id: parseMastodonAccountURI(status.account.url).globalUsername,
      timestampMs: new Date(status.createdAt).getTime(),
      post: status,
    };

    return { platformPost: post };
  }

  public async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<string>> {
    const account = UsersHelper.getProfile(
      postAndAuthor.author,
      PLATFORM.Mastodon,
      undefined,
      true
    );
    const content = postAndAuthor.post.generic.thread
      .map((post) => post.content)
      .join('\n\n');
    return {
      user_id: account.user_id,
      signerType: PlatformPostSignerType.DELEGATED,
      postApproval: PlatformPostDraftApproval.PENDING,
      unsignedPost: content,
    };
  }

  getSinglePost(
    post_id: string,
    credentials?: AccountCredentials
  ): Promise<{ platformPost: PlatformPostPosted } & WithCredentials> {
    throw new Error('Method not implemented.');
  }

  public async getThread(
    post_id: string,
    credentials: AccountCredentials<
      MastodonAccountCredentials,
      MastodonAccountCredentials
    >
  ): Promise<{ platformPost: PlatformPostPosted<MastodonThread> }> {
    if (!credentials.read) {
      throw new Error('read credentials are not provided');
    }

    const { server, postId } = parseMastodonPostURI(post_id);
    const client = await this.getClient(server, credentials?.read);

    const context = await client.v1.statuses.$select(postId).context.fetch();
    const rootStatus = await (async () => {
      if (context.ancestors.length === 0) {
        return await client.v1.statuses.$select(postId).fetch();
      }

      return context.ancestors.reduce((oldestStatus, currStatus) => {
        return Number(oldestStatus.id) < Number(currStatus.id)
          ? oldestStatus
          : currStatus;
      }, context.ancestors[0]);
    })();

    const contextOfRoot = await client.v1.statuses
      .$select(rootStatus.id)
      .context.fetch();

    const thread = this.constructThread(
      rootStatus,
      contextOfRoot,
      rootStatus.account.id
    );

    const platformPost = {
      post_id: thread.thread_id,
      user_id: parseMastodonAccountURI(thread.author.url).globalUsername,
      timestampMs: new Date(thread.posts[0].createdAt).getTime(),
      post: thread,
    };

    return { platformPost };
  }

  private constructThread(
    status: mastodon.v1.Status,
    context: mastodon.v1.Context,
    userId: string
  ): MastodonThread {
    const allStatuses = [...context.ancestors, status, ...context.descendants];
    const authorStatuses = allStatuses.filter((s) => s.account.id === userId);

    const sortedStatuses = authorStatuses.sort(
      (a, b) => Number(a.id) - Number(b.id)
    );

    const rootStatus = sortedStatuses[0];
    const thread = extractPrimaryThread(rootStatus.id, sortedStatuses);

    return {
      thread_id: rootStatus.uri,
      posts: thread,
      author: rootStatus.account,
    };
  }

  public async getProfileByUsername(
    username: string,
    credentials?: MastodonAccountCredentials
  ): Promise<PlatformAccountProfile> {
    try {
      const { server } = parseMastodonGlobalUsername(username);
      const client = await this.getClient(server, credentials);

      const mdProfile = await client.v1.accounts.lookup({
        acct: username,
      });

      const profile: PlatformAccountProfile = {
        user_id: parseMastodonAccountURI(mdProfile.url).globalUsername,
        profile: {
          id: mdProfile.id,
          avatar: mdProfile.avatar,
          displayName: mdProfile.displayName,
          username: getGlobalMastodonUsername(mdProfile.username, server),
          description: mdProfile.note,
        },
      };
      return profile;
    } catch (e: any) {
      throw new Error(`Error fetching Mastodon account: ${e.message}`);
    }
  }

  public async getProfile(
    user_id: string,
    credentials?: MastodonAccountCredentials
  ): Promise<PlatformAccountProfile> {
    const { server, localUsername } = parseMastodonGlobalUsername(user_id);
    const client = await this.getClient(server, credentials);

    const mdProfile = await client.v1.accounts.lookup({
      acct: localUsername,
    });

    const profile: PlatformAccountProfile = {
      user_id,
      profile: {
        id: mdProfile.id,
        avatar: mdProfile.avatar,
        displayName: mdProfile.displayName,
        username: getGlobalMastodonUsername(mdProfile.username, server),
        description: mdProfile.note,
      },
    };

    return profile;
  }
  isPartOfMainThread(
    rootPost: PlatformPost<MastodonThread>,
    post: PlatformPostCreate<MastodonThread>
  ): boolean {
    if (!rootPost.posted || !post.posted) {
      throw new Error('Unexpected undefined posted');
    }
    if (rootPost.posted.post_id !== post.posted.post_id) return false;
    const rootThreadPosts = rootPost.posted.post.posts;
    const lastRootThreadPost = rootThreadPosts[rootThreadPosts.length - 1];
    const newThreadPosts = post.posted.post.posts;
    const firstNewThreadPost = newThreadPosts[0];

    if (firstNewThreadPost.inReplyToId === lastRootThreadPost.id) return true;

    return false;
  }
  mergeBrokenThreads(
    rootPost: PlatformPost<MastodonThread>,
    post: PlatformPostCreate<MastodonThread>
  ): PlatformPostPosted | undefined {
    if (!rootPost.posted || !post.posted) {
      throw new Error('Unexpected undefined posted');
    }
    if (!this.isPartOfMainThread(rootPost, post)) {
      return undefined;
    }

    const mergedThread = [
      ...rootPost.posted?.post.posts,
      ...post.posted?.post.posts,
    ];
    rootPost.posted.post.posts = mergedThread;
    return rootPost.posted;
  }
  isRootThread(post: PlatformPostCreate<MastodonThread>): boolean {
    return post.posted?.post.posts[0].uri === post.posted?.post_id;
  }

  public async getRootPostId(
    post: MastodonPost,
    credentials?: AccountCredentials<
      MastodonAccountCredentials,
      MastodonAccountCredentials
    >
  ): Promise<string> {
    if (!post.inReplyToId) {
      return post.uri;
    }

    const { server, postId, username } = parseMastodonPostURI(post.uri);
    const client = await this.getClient(server, credentials?.read);

    const context = await client.v1.statuses.$select(postId).context.fetch();
    const rootPostId = context.ancestors.find(
      (status) => !status.inReplyToId
    )?.id;

    return buildMastodonPostUri(
      username,
      server,
      rootPostId || post.inReplyToId
    ); // if can't find the root id from the context, assume the root is the post's inReplyToId
  }
}
