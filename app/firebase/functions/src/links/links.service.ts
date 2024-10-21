import { RefMeta } from '../@shared/types/types.parser';
import { TransactionManager } from '../db/transaction.manager';
import { LinksRepository } from './links.repository';

export class LinksService {
  constructor(
    protected links: LinksRepository,
    protected config: { apiUrl: string }
  ) {}

  async fetchRefMeta(refUrlEncoded: string): Promise<RefMeta> {
    try {
      const res = await fetch(`${this.config.apiUrl}?url=${refUrlEncoded}`, {
        headers: [['Content-Type', 'application/json']],
        method: 'get',
      });
      return await res.json();
    } catch (e) {
      throw new Error(`Error fetching ref ${refUrlEncoded} meta: ${e}`);
    }
  }

  async getRefMeta(url: string, manager: TransactionManager): Promise<RefMeta> {
    const existing = await this.links.get(url, manager);
    if (existing) return existing;

    const refMeta = await this.fetchRefMeta(url);
    this.links.set(url, refMeta, manager);

    return refMeta;
  }

  async setRefMeta(refMeta: RefMeta, manager: TransactionManager) {
    this.links.set(refMeta.url, refMeta, manager);
  }
}
