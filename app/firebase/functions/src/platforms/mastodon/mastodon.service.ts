import { createOAuthAPIClient, createRestAPIClient, mastodon } from 'masto';

import { PlatformFetchParams } from '../../@shared/types/types.fetch';
import {
  MastodonGetContextParams,
  MastodonSignupContext,
  MastodonSignupData,
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
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';

const REDIRECT_URL = 'http://localhost:3000';

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
    const client = createRestAPIClient({
      url: `https://${params.domain}`,
    });

    const scopes = params.type === 'write' ? 'read write' : 'read';

    const app = await client.v1.apps.create({
      clientName: 'SenseNets',
      redirectUris: params.callback_url,
      scopes,
      website: params.domain,
    });

    return app;
  }

  public async getSignupContext(
    userId?: string,
    params?: MastodonGetContextParams
  ): Promise<MastodonSignupContext> {
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

    return {
      authorizationUrl,
      clientId: app.clientId,
      clientSecret: app.clientSecret,
    };
  }

  public async handleSignupData(
    signupData: MastodonSignupData
  ): Promise<MastodonUserDetails> {
    const client = createOAuthAPIClient({
      url: `https://${signupData.domain}`,
    });

    const token = await client.token.create({
      clientId: signupData.clientId,
      clientSecret: signupData.clientSecret,
      redirectUri: REDIRECT_URL,
      code: signupData.code,
      grantType: 'authorization_code',
    });

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

    return mastodon;
  }

  public async fetch(
    params: PlatformFetchParams,
    userDetails: MastodonUserDetails,
    manager: TransactionManager
  ): Promise<FetchedResult<mastodon.v1.Status>> {
    if (!userDetails.profile || !userDetails.read) {
      throw new Error('profile and/or read credentials are not provided');
    }
    const client = createRestAPIClient({
      url: `https://${userDetails.profile.mastodonServer}`,
      accessToken: userDetails.read.accessToken,
    });

    const fetchParams: any = {
      limit: params.expectedAmount,
    };
    if (params.since_id) {
      fetchParams.sinceId = params.since_id;
    }
    if (params.until_id) {
      fetchParams.maxId = params.until_id;
    }
    const statuses = await client.v1.accounts
      .$select(userDetails.user_id)
      .statuses.list({ limit: params.expectedAmount });

    const platformPosts = statuses.map((status) => ({
      post_id: status.id,
      user_id: status.account.id,
      timestampMs: new Date(status.createdAt).getTime(),
      post: status,
    }));

    return {
      fetched: {
        newest_id: platformPosts[0]?.post_id,
        oldest_id: platformPosts[platformPosts.length - 1]?.post_id,
      },
      platformPosts,
    };
  }

  public async convertToGeneric(
    platformPost: PlatformPostCreate<mastodon.v1.Status>
  ): Promise<GenericThread> {
    if (!platformPost.posted) {
      throw new Error('Unexpected undefined posted');
    }

    const status = platformPost.posted.post;
    const genericAuthor: GenericAuthor = {
      platformId: PLATFORM.Mastodon,
      id: status.account.id,
      username: status.account.username,
      name: status.account.displayName,
    };

    const genericPost: GenericPost = {
      url: status.url ? status.url : undefined,
      content: status.content,
    };

    return {
      author: genericAuthor,
      thread: [genericPost],
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
    const content = postAndAuthor.post.generic.thread
      .map((post) => post.content)
      .join('\n\n');
    return {
      user_id: postAndAuthor.author.userId,
      signerType: PlatformPostSignerType.DELEGATED,
      postApproval: PlatformPostDraftApproval.PENDING,
      unsignedPost: content,
    };
  }

  public async get(
    post_id: string,
    userDetails: MastodonUserDetails,
    manager?: TransactionManager
  ): Promise<PlatformPostPosted<mastodon.v1.Status>> {
    if (!userDetails.profile || !userDetails.read) {
      throw new Error('profile and/or read credentials are not provided');
    }
    const client = createRestAPIClient({
      url: `https://${userDetails.profile.mastodonServer}`,
      accessToken: userDetails.read.accessToken,
    });

    const status = await client.v1.statuses.$select(post_id).fetch();

    return {
      post_id: status.id,
      user_id: status.account.id,
      timestampMs: new Date(status.createdAt).getTime(),
      post: status,
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
