import { OntologyItem } from '../@shared/types/types.parser';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { hashUrl } from '../links/links.utils';
import { OntologiesRepository } from './ontologies.repository';

export class OntologiesService {
  constructor(public repo: OntologiesRepository) {}

  async setMany(
    items: OntologyItem[],
    manager: TransactionManager
  ): Promise<void> {
    for (const item of items) {
      const id = hashUrl(item.uri);
      const exists = await this.repo.exists(id, manager);

      if (!exists) {
        this.repo.set(id, removeUndefined(item), manager);
      }
    }
  }
}
