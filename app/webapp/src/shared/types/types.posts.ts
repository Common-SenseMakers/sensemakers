import { AppUser, PLATFORM } from './types';
import { AppPostSemantics, ParsePostResult } from './types.parser';
import { PlatformPost } from './types.platform.posts';

/**
 * Properties of a post that must be computed in the convertToGeneric method
 */
export interface GenericPostData {
  content: string;
}

/**
 * AppPost object as stored on our database
 *  */
export interface AppPost extends GenericPostData {
  id: string; // the id may be autogenerated by the DB or computed from an original platform post_id
  authorId: string;
  origin: PLATFORM; // The platform where the post originated
  createdAtMs: number;
  parsingStatus: 'idle' | 'processing' | 'errored';
  parsedStatus: 'unprocessed' | 'processed';
  reviewedStatus: 'pending' | 'reviewed';
  originalParsed?: ParsePostResult;
  semantics?: AppPostSemantics;
  mirrorsIds: string[];
}

export type AppPostCreate = Omit<AppPost, 'id'>;

/**
 * Wrapper object that joins an AppPost, all its mirrors and its
 * author profile (including credentials). Useful to transfer publishing
 * information between services
 * */
export interface AppPostFull extends Omit<AppPost, 'mirrorsIds'> {
  mirrors: PlatformPost[];
}

export interface PostAndAuthor {
  post: AppPostFull;
  author: AppUser;
}

/**
 * Payload to mirror a post on other platforms,
 */
export interface AppPostMirror {
  postId: string;
  content?: string;
  semantics?: AppPostSemantics;
  mirrors: PlatformPost[];
}

/**
 * PostUpdate
 */
export type PostUpdate = Partial<
  Pick<
    AppPost,
    | 'content'
    | 'semantics'
    | 'originalParsed'
    | 'parsingStatus'
    | 'parsedStatus'
    | 'reviewedStatus'
  >
>;

export interface UserPostsQueryParams {
  status?: 'published' | 'ignored' | 'for review' | 'all';
}
