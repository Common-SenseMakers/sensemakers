import * as crypto from 'crypto';

import { RefMeta } from '../@shared/types/types.parser';
import { AppPost } from '../@shared/types/types.posts';
import { normalizeUrl } from '../@shared/utils/links.utils';

export function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

export function getOriginalRefMetaFromPost(post: AppPost, ref: string) {
  const originalRefsMeta = post.originalParsed?.support?.refs_meta;
  if (!originalRefsMeta) {
    return undefined;
  }
  const normalizedRefsMeta: Record<string, RefMeta> = {};
  Object.entries(originalRefsMeta).forEach(([orgRef, refMeta]) => {
    normalizedRefsMeta[normalizeUrl(orgRef)] = refMeta;
  });

  return normalizedRefsMeta[ref];
}
