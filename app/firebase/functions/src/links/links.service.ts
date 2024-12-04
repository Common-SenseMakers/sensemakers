import {
  LinkSource,
  OEmbed,
  RefPostData,
} from '../@shared/types/types.references';
import { normalizeUrl } from '../@shared/utils/links.utils';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { TimeService } from '../time/time.service';
import { LinksRepository } from './links.repository';
import { hashAndNormalizeUrl, hashUrl } from './links.utils';

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
    public links: LinksRepository,
    protected time: TimeService,
    protected config: LinksConfig
  ) {}

  async fetchOEmbed(
    url: string
  ): Promise<{ success: boolean; oembed: OEmbed }> {
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
      if (resJson.status === 403) {
        return {
          success: false,
          oembed: { original_url: url, url: normalizedUrl },
        };
      }
      const resData = resJson as OEmbed;
      const oembed = { ...resData, original_url: url, url: normalizedUrl };
      return { success: true, oembed };
    } catch (e) {
      logger.warn(`Error fetching ref ${url} meta: ${e}`);
      const oembed = { original_url: url, url: normalizedUrl, success: false };
      return { success: true, oembed };
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

    /** refetch from iframely links that have not been fetched */
    if (existing && existing.sources && existing.sources[LinkSource.iframely]) {
      return existing.oembed;
    }

    const iframely = await this.fetchOEmbed(url);
    const originalRefMeta = removeUndefined({
      title: parsedMeta?.title,
      summary: parsedMeta?.summary,
    });

    const newOembed: OEmbed = {
      ...originalRefMeta,
      ...iframely.oembed,
    };

    /** parser decides type */
    newOembed.type = originalRefMeta.type;

    this.links.set(
      urlHash,
      {
        oembed: newOembed,
        sources: {
          [LinkSource.parser]: {
            timestamp: this.time.now(),
            status: 'SUCCESS',
          },
          [LinkSource.iframely]: {
            timestamp: this.time.now(),
            status: iframely.success ? 'SUCCESS' : 'ERROR',
          },
        },
      },
      manager
    );

    return newOembed;
  }

  async setOEmbed(oembed: OEmbed, manager: TransactionManager) {
    this.links.set(hashAndNormalizeUrl(oembed.url), { oembed }, manager);
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
