import { ClusterInstance } from '../@shared/types/types.clusters';
import { ClustersRepository } from './clusters.repository';

export class ClustersService {
  constructor(public repo: ClustersRepository) {}

  getInstance(clusterId?: string) {
    const cluster = clusterId
      ? this.repo.getRef(clusterId)
      : (this.repo.db.firestore as ClusterInstance);

    return cluster;
  }
}
