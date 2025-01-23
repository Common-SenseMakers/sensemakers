import { Cluster } from '../@shared/types/types.clusters';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';

/** the LinksRepository store the links OEmbed data only */
export class ClustersRepository extends BaseRepository<Cluster, Cluster> {
  constructor(public db: DBInstance) {
    super(db.collections.clusters);
  }
}
