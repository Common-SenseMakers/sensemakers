import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { PostTriple, PostTripleCreate } from '../@shared/types/types.triples';
import { FetchParams } from 'src/@shared/types/types';
import { AppPost } from 'src/@shared/types/types.posts';

export class TriplesRepository extends BaseRepository<PostTriple, PostTripleCreate> {
  constructor(protected db: DBInstance) {
    super(db.collections.triples);
  }

  public async getWithPredicatesOfUser(userId: string, labelsUris: string[],fetchParams: FetchParams ) {
    const predicate_property: keyof PostTriple = 'predicate';
    const userId_property: keyof PostTriple = 'authorId';
    const createdAt_property: keyof PostTriple = 'createdAtMs';

    const base = this.db.collections.triples.where(userId_property, '==', userId)
    
    const filtered = (() => {
        return base.where(predicate_property, 'in', labelsUris);
    })();

    const { untilCreatedAt } = await (async () => {
      return this.db.run(async (manager) => {
        let untilCreatedAt: number | undefined;

        if (fetchParams.untilId) {
          const until = await this.get(
            fetchParams.untilId,
            manager
          );
          untilCreatedAt = until ? until.createdAtMs : undefined;
        }

        return { untilCreatedAt };
      });
    })();

    const paginated = await (async () => {
        const ordered = filtered.orderBy(createdAt_property, 'desc');
        return untilCreatedAt ? ordered.startAfter(untilCreatedAt) : ordered;
    })();


    const snap = await paginated.limit(fetchParams.expectedAmount).get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AppPost[];
  }
}
