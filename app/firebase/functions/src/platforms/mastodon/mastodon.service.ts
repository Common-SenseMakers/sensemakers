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
  AccountProfileBase,
  PlatformProfile,
} from '../../@shared/types/types.profiles';
import { AccountCredentials } from '../../@shared/types/types.user';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';
import {
  cleanMastodonContent,
  convertMastodonPostsToThreads,
  extractPrimaryThread,
  getGlobalMastodonUsername,
  parseMastodonAccountURI,
  parseMastodonGlobalUsername,
  parseMastodonPostURI,
} from './mastodon.utils';

const DEBUG = true;
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
      clientName: 'SenseNets',
      redirectUris: params.callback_url,
      scopes,
      website: `https://${params.mastodonServer}`,
    });

    if (DEBUG) logger.debug('createApp result', { app }, DEBUG_PREFIX);

    return app;
  }

  public getClient(server: string, credentials?: MastodonAccountCredentials) {
    return createRestAPIClient({
      url: `https://${server}`,
      accessToken: credentials
        ? credentials.accessToken
        : this.config.accessTokens[server],
    });
  }

  public async getSignupContext(
    userId?: string,
    params?: MastodonGetContextParams
  ): Promise<MastodonSignupContext> {
    if (DEBUG)
      logger.debug('getSignupContext', { userId, params }, DEBUG_PREFIX);

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

    const mastoClient = this.getClient(signupData.mastodonServer, {
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

    const profile: AccountProfileBase<PlatformProfile> = {
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
    const client = this.getClient(server, credentials?.read);

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

    if (DEBUG) logger.debug('fetch params', { fetchParams }, DEBUG_PREFIX);

    const paginator = client.v1.accounts
      .$select(account.id)
      .statuses.list(fetchParams);

    let allStatuses: MastodonPost[] = [];
    let newestId: string | undefined;
    let oldestId: string | undefined;

    while (true) {
      const result = await paginator.next();
      if (result.done) break;

      const statuses = result.value;
      if (statuses.length === 0) break;

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

    const platformPosts = threads.map((thread) => ({
      post_id: thread.thread_id,
      user_id,
      timestampMs: new Date(thread.posts[0].createdAt).getTime(),
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

    const genericPosts: GenericPost[] = thread.posts.map((status) => ({
      url: status.url ? status.url : undefined,
      content: cleanMastodonContent(status.content),
    }));

    return {
      author: genericAuthor,
      thread: genericPosts,
    };
  }

  public async publish(
    postPublish: PlatformPostPublish<string, MastodonAccountCredentials>
  ): Promise<{ post: PlatformPostPosted<mastodon.v1.Status> }> {
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

    return { post };
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

  public async get(
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
    const client = this.getClient(server, credentials?.read);

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
  ): Promise<AccountProfileBase<PlatformProfile>> {
    try {
      const { server } = parseMastodonGlobalUsername(username);
      const client = this.getClient(server, credentials);

      const mdProfile = await client.v1.accounts.lookup({
        acct: username,
      });

      const profile: AccountProfileBase<PlatformProfile> = {
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
  ): Promise<AccountProfileBase<PlatformProfile>> {
    const { server, localUsername } = parseMastodonGlobalUsername(user_id);
    const client = this.getClient(server, credentials);

    const mdProfile = await client.v1.accounts.lookup({
      acct: localUsername,
    });

    const profile: AccountProfileBase<PlatformProfile> = {
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
}
