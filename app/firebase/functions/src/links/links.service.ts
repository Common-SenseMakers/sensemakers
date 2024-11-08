import { RefMeta } from '../@shared/types/types.parser';
import { OEmbed, RefPostData } from '../@shared/types/types.references';
import { TransactionManager } from '../db/transaction.manager';
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
    try {
      const res = await fetch(
        `${this.config.apiUrl}/oembed?url=${encodeURIComponent(url)}&api_key=${this.config.apiKey}`,
        {
          headers: [['Content-Type', 'application/json']],
          method: 'get',
        }
      );
      return await res.json();
    } catch (e) {
      throw new Error(`Error fetching ref ${url} meta: ${e}`);
    }
  }

  async getOEmbed(url: string, manager: TransactionManager): Promise<OEmbed> {
    const normalizedUrl = normalizeUrl(url);
    const urlHash = hashUrl(normalizedUrl);
    const existing = await this.links.get(urlHash, manager);
    if (existing) return existing;

    const oembed = await this.fetchOEmbed(normalizedUrl);
    this.links.set(urlHash, oembed, manager);

    return oembed;
  }

  async setOEmbed(oembed: OEmbed, manager: TransactionManager) {
    this.links.set(hashAndNormalizeUrl(oembed.url), oembed, manager);
  }

  async setPostWithRef(
    url: string,
    postData: RefPostData,
    manager: TransactionManager
  ) {
    const linkId = hashAndNormalizeUrl(url);
    const postRef: RefPostData = {
      ...postData,
    };

    await this.links.setPostRef(linkId, postRef, manager);
  }

  async getPostsWithRef(url: string, manager: TransactionManager) {
    const linkId = hashAndNormalizeUrl(url);
    return this.links.getPostRefs(linkId, manager);
  }
}
