import {
  ActivityEventBase,
  ActivityEventCreate,
} from '../@shared/types/types.activity';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';

export class ActivityRepository extends BaseRepository<
  ActivityEventBase<any>,
  ActivityEventCreate<any>
> {
  constructor(protected db: DBInstance) {
    super(db.collections.activity, db);
  }
}
