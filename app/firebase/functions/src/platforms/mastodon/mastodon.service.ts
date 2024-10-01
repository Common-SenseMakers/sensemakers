import { createOAuthAPIClient, createRestAPIClient, mastodon } from 'masto';

import { PlatformFetchParams } from '../../@shared/types/types.fetch';
import {
  MastodonGetContextParams,
  MastodonPost,
  MastodonSignupContext,
  MastodonSignupData,
  MastodonThread,
  MastodonUserDetails,
} from '../../@shared/types/types.mastodon';
import {
  FetchedResult,
  PlatformPostCreate,
  PlatformPostDeleteDraft,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostPosted,
  PlatformPostPublish,
  PlatformPostSignerType,
  PlatformPostUpdate,
} from '../../@shared/types/types.platform.posts';
import {
  AppPostFull,
  GenericAuthor,
  GenericPost,
  GenericThread,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import { AppUser, PLATFORM } from '../../@shared/types/types.user';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';
import {
  cleanMastodonContent,
  convertMastodonPostsToThreads,
  extractPrimaryThread,
} from './mastodon.utils';

const DEBUG = true;
const DEBUG_PREFIX = 'MastodonService';

export class MastodonService
  implements
    PlatformService<
      MastodonSignupContext,
      MastodonSignupData,
      MastodonUserDetails
    >
{
  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository
  ) {}

  protected async createApp(params: MastodonGetContextParams) {
    if (DEBUG) logger.debug('createApp', { params }, DEBUG_PREFIX);

    const client = createRestAPIClient({
      url: `https://${params.domain}`,
    });

    const scopes = params.type === 'write' ? 'read write' : 'read';

    const app = await client.v1.apps.create({
      clientName: 'SenseNets',
      redirectUris: params.callback_url,
      scopes,
      website: `https://${params.domain}`,
    });

    if (DEBUG) logger.debug('createApp result', { app }, DEBUG_PREFIX);

    return app;
  }

  public async getSignupContext(
    userId?: string,
    params?: MastodonGetContextParams
  ): Promise<MastodonSignupContext> {
    if (DEBUG)
      logger.debug('getSignupContext', { userId, params }, DEBUG_PREFIX);

    if (!params || !params.domain || !params.callback_url) {
      throw new Error('Mastodon domain and callback URL are required');
    }

    const app = await this.createApp(params);
    if (!app.clientId || !app.clientSecret) {
      throw new Error('Failed to create Mastodon app');
    }

    const scopes = params.type === 'write' ? 'read+write' : 'read';

    const authorizationUrl =
      `https://${params.domain}/oauth/authorize?` +
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

  public async handleSignupData(
    signupData: MastodonSignupData
  ): Promise<MastodonUserDetails> {
    if (DEBUG) logger.debug('handleSignupData', { signupData }, DEBUG_PREFIX);

    const token = await (async () => {
      if ('accessToken' in signupData) {
        return { accessToken: signupData.accessToken };
      }
      const client = createOAuthAPIClient({
        url: `https://${signupData.domain}`,
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

    const mastoClient = createRestAPIClient({
      url: `https://${signupData.domain}`,
      accessToken: token.accessToken,
    });

    const account = await mastoClient.v1.accounts.verifyCredentials();
    const mastodon: MastodonUserDetails = {
      user_id: account.id,
      signupDate: this.time.now(),
      profile: {
        id: account.id,
        username: account.username,
        displayName: account.displayName,
        avatar: account.avatar,
        mastodonServer: signupData.domain,
      },
      read: {
        accessToken: token.accessToken,
      },
    };
    if (signupData.type === 'write') {
      mastodon['write'] = { accessToken: token.accessToken };
    }

    if (DEBUG)
      logger.debug('handleSignupData result', { mastodon }, DEBUG_PREFIX);

    return mastodon;
  }

  public async fetch(
    params: PlatformFetchParams,
    userDetails: MastodonUserDetails,
    manager: TransactionManager
  ): Promise<FetchedResult<MastodonThread>> {
    if (DEBUG) logger.debug('fetch', { params, userDetails }, DEBUG_PREFIX);

    if (!userDetails.profile || !userDetails.read) {
      throw new Error('profile and/or read credentials are not provided');
    }
    const client = createRestAPIClient({
      url: `https://${userDetails.profile.mastodonServer}`,
      accessToken: userDetails.read.accessToken,
    });

    const fetchParams: any = {
      limit: 40, // Default limit
      excludeReplies: true,
      excludeReblogs: true,
    };

    if (params.since_id) {
      fetchParams.minId = params.since_id;
    }
    if (params.until_id) {
      fetchParams.maxId = params.until_id;
    }

    if (DEBUG) logger.debug('fetch params', { fetchParams }, DEBUG_PREFIX);

    const paginator = client.v1.accounts
      .$select(userDetails.user_id)
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

      if (!newestId) newestId = sortedStatuses[0].id;
      newestId =
        sortedStatuses[0].id > newestId ? sortedStatuses[0].id : newestId;
      if (!oldestId) oldestId = sortedStatuses[sortedStatuses.length - 1].id;
      oldestId =
        sortedStatuses[sortedStatuses.length - 1].id < oldestId
          ? sortedStatuses[sortedStatuses.length - 1].id
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
      user_id: thread.author.id,
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
    const genericAuthor: GenericAuthor = {
      platformId: PLATFORM.Mastodon,
      id: thread.author.id,
      username: thread.author.username,
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
    postPublish: PlatformPostPublish<string>,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<mastodon.v1.Status>> {
    const userDetails = postPublish.userDetails as MastodonUserDetails;
    if (!userDetails.profile || !userDetails.write) {
      throw new Error('profile and/or write credentials are not provided');
    }
    const client = createRestAPIClient({
      url: `https://${userDetails.profile.mastodonServer}`,
      accessToken: userDetails.write.accessToken,
    });

    const status = await client.v1.statuses.create({
      status: postPublish.draft,
    });

    return {
      post_id: status.id,
      user_id: status.account.id,
      timestampMs: new Date(status.createdAt).getTime(),
      post: status,
    };
  }

  public async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<string>> {
    const account = UsersHelper.getAccount(
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
    userDetails: MastodonUserDetails,
    manager?: TransactionManager
  ): Promise<PlatformPostPosted<MastodonThread>> {
    if (!userDetails.profile || !userDetails.read) {
      throw new Error('profile and/or read credentials are not provided');
    }
    const client = createRestAPIClient({
      url: `https://${userDetails.profile.mastodonServer}`,
      accessToken: userDetails.read.accessToken,
    });

    const context = await client.v1.statuses.$select(post_id).context.fetch();
    const rootStatus = await (async () => {
      if (context.ancestors.length === 0) {
        return await client.v1.statuses.$select(post_id).fetch();
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
      userDetails.user_id
    );

    return {
      post_id: thread.thread_id,
      user_id: thread.author.id,
      timestampMs: new Date(thread.posts[0].createdAt).getTime(),
      post: thread,
    };
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
      thread_id: rootStatus.id,
      posts: thread,
      author: rootStatus.account,
    };
  }

  public async update(
    post: PlatformPostUpdate<string>,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<mastodon.v1.Status>> {
    throw new Error('Method not implemented.');
  }

  public async buildDeleteDraft(
    post_id: string,
    post: AppPostFull,
    author: AppUser
  ): Promise<PlatformPostDeleteDraft | undefined> {
    return undefined;
  }

  public async signDraft(
    post: PlatformPostDraft<string>,
    account: MastodonUserDetails
  ): Promise<string> {
    return post.unsignedPost || '';
  }
}
