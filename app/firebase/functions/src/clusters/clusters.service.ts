import { ClusterInstance } from '../@shared/types/types.clusters';
import { logger } from '../instances/logger';
import { ClustersRepository } from './clusters.repository';

const DEBUG = false;
const DEBUG_PREFIX = 'ClustersService';
export class ClustersService {
  constructor(public repo: ClustersRepository) {}

  getInstance(clusterId?: string) {
    const cluster = clusterId
      ? this.repo.getRef(clusterId)
      : (this.repo.db.firestore as ClusterInstance);

    return cluster;
  }

  async getClustersIds() {
    const ids = await this.repo.getAll();
    if (DEBUG) {
      logger.debug(`getClustersIds`, { ids }, DEBUG_PREFIX);
    }
    return ids;
  }
}
