import { AppPost } from './types.posts';

export interface OEmbed {
  url: string;
  original_url?: string;
  title?: string;
  summary?: string;
  provider_name?: string;
  provider_url?: string;
  thumbnail_url?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

export type RefPostData = Pick<
  AppPost,
  'id' | 'authorProfileId' | 'createdAtMs' | 'structuredSemantics'
> & {
  platformPostUrl?: string;
};

export interface RefLabel {
  label: string;
  postId?: string;
  authorProfileId?: string;
  platformPostUrl?: string;
}