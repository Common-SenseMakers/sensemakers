import * as crypto from 'crypto';

import { AppPost } from '../@shared/types/types.posts';
import { normalizeUrl } from '../@shared/utils/links.utils';

export function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

export function handleQuotePostReference(reference: string, post: AppPost) {
  const quotedPostUrl = post.generic.thread[0].quotedThread?.thread[0].url;
  if (!quotedPostUrl) {
    return reference;
  }
  const normalizedQuotedPostUrl = normalizeUrl(quotedPostUrl);
  const lowercaseQuotedPostUrl = normalizedQuotedPostUrl.toLowerCase();
  if (reference === lowercaseQuotedPostUrl) {
    return normalizedQuotedPostUrl;
  }
  return reference;
}
