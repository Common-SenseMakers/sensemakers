import { LinkMeta } from '../@shared/types/types.references';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';

/** the LinksRepository store the links OEmbed data only */
export class LinksRepository extends BaseRepository<LinkMeta, LinkMeta> {
  constructor(protected db: DBInstance) {
    super(db.collections.links, db);
  }
}
