import { RefMeta } from '../@shared/types/types.parser';
import { PostSubcollectionIndex } from '../@shared/types/types.posts';
import {
  LinkMeta,
  LinkSource,
  OEmbed,
} from '../@shared/types/types.references';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { TimeService } from '../time/time.service';
import { LinksRepository } from './links.repository';
import { hashUrl } from './links.utils';

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
  ): Promise<{ success: boolean; oembed?: OEmbed }> {
    try {
      const res = await fetch(
        `${this.config.apiUrl}/oembed?url=${encodeURIComponent(url)}&api_key=${this.config.apiKey}`,
        {
          headers: [['Content-Type', 'application/json']],
          method: 'get',
        }
      );
      const resJson = await res.json();
      if (resJson.status === 403) {
        return {
          success: false,
        };
      }
      const resData = resJson as OEmbed;
      const oembed = { ...resData, original_url: url, url };
      return { success: true, oembed };
    } catch (e) {
      logger.warn(`Error fetching ref ${url} meta: ${e}`);
      return { success: false };
    }
  }

  async getByUrl<T extends boolean>(
    url: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const urlHash = hashUrl(url);
    return this.links.get(urlHash, manager, shouldThrow);
  }

  setByUrl(url: string, newLinkMeta: LinkMeta, manager: TransactionManager) {
    const urlHash = hashUrl(url);
    this.links.set(urlHash, newLinkMeta, manager);
  }

  async refreshOEmbed(
    url: string,
    manager: TransactionManager,
    refMetaOrg?: RefMeta
  ) {
    const iframely = await this.fetchOEmbed(url);
    const originalRefMeta =
      refMetaOrg &&
      removeUndefined<RefMeta>({
        title: refMetaOrg.title,
        summary: refMetaOrg.summary,
        description: refMetaOrg.summary,
        url: refMetaOrg.url,
      });

    const oembed: OEmbed = {
      ...(originalRefMeta as RefMeta),
      ...iframely.oembed,
    };

    /** parser decides type */
    oembed.type = refMetaOrg?.item_type;

    this.setByUrl(
      url,
      {
        oembed: removeUndefined(oembed),
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

    return oembed;
  }

  async getOEmbed(
    url: string,
    manager: TransactionManager,
    refMetaOrg?: RefMeta
  ): Promise<OEmbed> {
    const existing = await this.getByUrl(url, manager);

    /** refetch from iframely links that have not been fetched */
    if (existing && existing.sources && existing.sources[LinkSource.iframely]) {
      const newOembed = {
        ...existing.oembed,
        type: refMetaOrg?.item_type,
      };
      return newOembed;
    }

    const newOembed = await this.refreshOEmbed(url, manager, refMetaOrg);
    return newOembed;
  }

  async setRefPost(
    url: string,
    postData: PostSubcollectionIndex,
    manager: TransactionManager
  ) {
    const linkId = hashUrl(url);
    await this.links.setRefPost(linkId, postData, manager);
  }

  async getRefPosts(url: string, manager: TransactionManager) {
    const linkId = hashUrl(url);
    return this.links.getRefPosts(linkId, manager);
  }

  async deleteRefPost(
    url: string,
    postId: string,
    manager: TransactionManager
  ) {
    const linkId = hashUrl(url);
    return this.links.deleteRefPost(linkId, postId, manager);
  }
}
