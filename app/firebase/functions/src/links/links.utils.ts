import * as crypto from 'crypto';

import { normalizeUrl } from '../@shared/utils/links.utils';

export function hashAndNormalizeUrl(url: string): string {
  return hashUrl(normalizeUrl(url));
}

export function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}
