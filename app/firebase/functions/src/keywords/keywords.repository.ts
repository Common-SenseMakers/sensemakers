import { KeywordMeta } from '../../../../webapp/src/shared/types/types.keywords';
import { LinkMeta } from '../@shared/types/types.references';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';

export class KeywordsRepository extends BaseRepository<KeywordMeta, LinkMeta> {
  constructor(protected db: DBInstance) {
    super(db.collections.links, db);
  }
}
