import { RefMeta } from '../@shared/types/types.parser';
import { OEmbed, RefPostData } from '../@shared/types/types.references';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { LinksRepository } from './links.repository';
import { hashAndNormalizeUrl, hashUrl, normalizeUrl } from './links.utils';

export interface LinksMockConfig {
  get: boolean;
  enable?: boolean;
}

export interface LinksConfig {
  apiUrl: string;
  apiKey: string;
}

export class LinksService {
  constructor(
    protected links: LinksRepository,
    protected config: LinksConfig
  ) {}

  async fetchOEmbed(url: string): Promise<RefMeta> {
    const normalizedUrl = normalizeUrl(url);
    try {
      const res = await fetch(
        `${this.config.apiUrl}/oembed?url=${encodeURIComponent(normalizedUrl)}&api_key=${this.config.apiKey}`,
        {
          headers: [['Content-Type', 'application/json']],
          method: 'get',
        }
      );
      const resJson = await res.json();
      const resData = resJson as RefMeta;
      return { ...resData, original_url: url, url: normalizedUrl };
    } catch (e) {
      logger.warn(`Error fetching ref ${url} meta: ${e}`);
      return { original_url: url, url: normalizedUrl };
    }
  }

  async getOEmbed(
    url: string,
    manager: TransactionManager,
    parsedMeta?: OEmbed
  ): Promise<OEmbed> {
    const normalizedUrl = normalizeUrl(url);
    const urlHash = hashUrl(normalizedUrl);
    const existing = await this.links.get(urlHash, manager);
    if (existing) return existing;

    const oembed = await this.fetchOEmbed(url);
    const originalRefMeta = removeUndefined({
      title: parsedMeta?.title,
      summary: parsedMeta?.summary,
    });
    this.links.set(
      urlHash,
      {
        ...originalRefMeta,
        ...oembed,
      },
      manager
    );

    return oembed;
  }

  async setOEmbed(oembed: OEmbed, manager: TransactionManager) {
    this.links.set(hashAndNormalizeUrl(oembed.url), oembed, manager);
  }

  async setRefPost(
    url: string,
    postData: RefPostData,
    manager: TransactionManager
  ) {
    const linkId = hashAndNormalizeUrl(url);

    await this.links.setRefPost(linkId, postData, manager);
  }

  async getRefPosts(url: string, manager: TransactionManager) {
    const linkId = hashAndNormalizeUrl(url);
    return this.links.getRefPosts(linkId, manager);
  }

  async deleteRefPost(
    url: string,
    postId: string,
    manager: TransactionManager
  ) {
    const linkId = hashAndNormalizeUrl(url);
    return this.links.deleteRefPost(linkId, postId, manager);
  }
}
