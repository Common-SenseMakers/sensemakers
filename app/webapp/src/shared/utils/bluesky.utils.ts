import { BLUESKY_REPOST_URI_QUERY } from '../types/types.bluesky';
import { AccountProfileRead } from '../types/types.profiles';

export interface BlueskyURI {
  did: string;
  collection: string;
  rkey: string;
  repostedByDid?: string;
}

export function parseBlueskyURI(uri: string): BlueskyURI {
  try {
    if (!uri.startsWith('at://')) {
      throw new Error('Invalid URI: must start with "at://".');
    }

    const parts = uri.split('/');

    if (parts.length !== 5) {
      throw new Error('Invalid URI: expected exactly 5 parts.');
    }

    const [, , did, collection, rkeyAndRepost] = parts;

    const rkeyAndRepostParts = rkeyAndRepost.split(BLUESKY_REPOST_URI_QUERY);
    if (rkeyAndRepostParts.length > 2) {
      throw new Error('Invalid URI: too many repost query parameters.');
    }
    if (rkeyAndRepostParts.length === 2) {
      const [rkey, repostedByDid] = rkeyAndRepostParts;
      return { did, collection, rkey, repostedByDid };
    }

    return { did, collection, rkey: rkeyAndRepostParts[0] };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export const getBlueskyProfileDetails = (profile: AccountProfileRead) => {
  return { accountURL: `https://bsky.app/profile/${profile.user_id}` };
};
