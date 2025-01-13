import { OntologyItem } from '../@shared/types/types.parser';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';

/** the LinksRepository store the links OEmbed data only */
export class OntologiesRepository extends BaseRepository<
  OntologyItem,
  OntologyItem
> {
  constructor(protected db: DBInstance) {
    super(db.collections.ontologies);
  }
}
