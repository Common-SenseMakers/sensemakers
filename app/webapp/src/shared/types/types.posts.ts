import { FetchParams } from './types.fetch';
import { AppPostSemantics, ParsePostResult, RefMeta } from './types.parser';
import { PlatformPost } from './types.platform.posts';
import { PLATFORM } from './types.platforms';
import { RefDisplayMeta } from './types.references';
import { AppUserRead } from './types.user';

export interface GenericAuthor {
  platformId: PLATFORM;
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
}

export interface GenericPost {
  url?: string;
  content: string;
  quotedThread?: GenericThread;
}

export interface EngagementMetrics {
  likes: number;
  reposts: number;
  replies: number;
  quotes?: number;
}

export interface GenericThread {
  url?: string;
  thread: GenericPost[];
  author: GenericAuthor;
  metrics?: EngagementMetrics;
}

/** Structured semantics */
export interface TabsInfo {
  isTab01: boolean;
  isTab02: boolean;
  isTab03: boolean;
  isTab04: boolean;
  isTab05: boolean;
  isTab06: boolean;
}

export interface StructuredSemantics {
  tabs?: TabsInfo;
  keywords?: string[];
  refs?: string[];
  topic?: string;

  labels?: ArrayIncludeQuery;
  refsMeta?: Record<string, RefMeta>;
}

export type ArrayIncludeQuery = string[];

export interface StructuredSemanticsQuery {
  tab?: number;
  keyword?: string;
  ref?: string;
  topic?: string;
}

/**
 * AppPost object as stored on our database
 *  */
export enum AppPostParsingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  ERRORED = 'errored',
  EXPIRED = 'expired',
}
export enum AppPostParsedStatus {
  UNPROCESSED = 'unprocessed',
  PROCESSED = 'processed',
}
export enum AppPostEditStatus {
  PENDING = 'pending',
  DRAFT = 'draft',
  UPDATED = 'updated',
}

interface AppPostBase {
  id: string; // the id may be autogenerated by the DB or computed from an original platform post_id
  generic: GenericThread;
  authorUserId?: string; // Defined only if author is a signedup user
  authorProfileId: string;
  origin: PLATFORM; // The platform where the post originated
  createdAtMs: number;
  parsingStatus: AppPostParsingStatus;
  parsingStartedAtMs?: number;
  parsedStatus: AppPostParsedStatus;
  editStatus: AppPostEditStatus;
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  mirrorsIds: string[];
}

export interface RankingScores {
  score1?: number;
  score2?: number;
  score3?: number;
  score4?: number;
  score5?: number;
  score6?: number;
  score7?: number;
  score8?: number;
  score9?: number;
  score10?: number;
}
export interface AppPost extends AppPostBase {
  structuredSemantics?: StructuredSemantics; // for indexing purposes. Will be duplicated across subcollections
  scores?: RankingScores;
}

export interface HydrateConfig {
  addMirrors?: boolean;
  addAggregatedLabels?: boolean;
}

export interface PostReadMeta {
  references: Record<string, RefDisplayMeta>;
}
export interface AppPostRead extends AppPost {
  meta?: PostReadMeta;
}

export type AppPostCreate = Omit<AppPost, 'id'>;

/**
 * Wrapper object that joins an AppPost, all its mirrors and its
 * author profile (including credentials). Useful to transfer publishing
 * information between services
 * */
export interface AppPostFull extends Omit<AppPostRead, 'mirrorsIds'> {
  mirrors?: PlatformPost[];
}

export interface PostAndAuthor {
  post: AppPostFull;
  author: AppUserRead;
}

/**
 * PostUpdate
 */
export type PostUpdate = Partial<
  Pick<
    AppPost,
    | 'authorUserId'
    | 'generic'
    | 'semantics'
    | 'structuredSemantics'
    | 'originalParsed'
    | 'parsingStatus'
    | 'parsingStartedAtMs'
    | 'parsedStatus'
    | 'editStatus'
  >
>;

export interface PostUpdatePayload {
  postId: string;
  postUpdate: PostUpdate;
}

export interface UnpublishPlatformPostPayload {
  postId: string;
  platformId: PLATFORM;
  post_id: string;
}

export enum PeriodSize {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export interface PeriodRange {
  start: number;
  end: number;
}

export interface PostsQueryParams {
  userId?: string;
  profileId?: string;
  origins?: ArrayIncludeQuery;
  semantics?: StructuredSemanticsQuery;
  hydrateConfig?: HydrateConfig;
  range?: PeriodRange;
}

export interface PostsQuery extends PostsQueryParams {
  fetchParams: FetchParams;
  clusterId?: string;
}

export interface ProfilePostsQuery {
  platformId: PLATFORM;
  username: string;
  labelsUris?: string[];
  fetchParams: FetchParams;
}
export interface MastodonGetContextParams {
  mastodonServer: string;
  callback_url: string;
  type: 'read' | 'write';
}

export interface GetPostPayload {
  postId: string;
  config?: HydrateConfig;
}

export type IndexedPost = Pick<
  AppPost,
  | 'id'
  | 'authorUserId'
  | 'origin'
  | 'authorProfileId'
  | 'createdAtMs'
  | 'structuredSemantics'
  | 'scores'
>;

export interface IndexedCollectionEntry {
  nPosts: number;
}

export interface GetIndexedEntries {
  clusterId?: string;
  afterId?: string;
}
