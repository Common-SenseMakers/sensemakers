import { OEmbed, RefMeta } from '../@shared/types/types.parser';
import { TransactionManager } from '../db/transaction.manager';
import { LinksRepository } from './links.repository';

export interface LinksMockConfig {
  get: boolean;
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
    const existing = await this.links.get(url, manager);
    if (existing) return existing;

    const oembed = await this.fetchOEmbed(url);
    this.links.set(url, oembed, manager);

    return oembed;
  }

  async setOEmbed(oembed: OEmbed, manager: TransactionManager) {
    this.links.set(oembed.url, oembed, manager);
  }
}
