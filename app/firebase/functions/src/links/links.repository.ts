import { OEmbed } from '../@shared/types/types.parser';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';

export class LinksRepository extends BaseRepository<OEmbed, OEmbed> {
  constructor(protected db: DBInstance) {
    super(db.collections.links, db);
  }
}
