import { FetchParams } from '../@shared/types/types.fetch';
import { PostTriple, PostTripleCreate } from '../@shared/types/types.triples';
import { DBInstance } from '../db/instance';
import { BaseRepository } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class TriplesRepository extends BaseRepository<
  PostTriple,
  PostTripleCreate
> {
  constructor(protected db: DBInstance) {
    super(db.collections.triples);
  }

  public async deleteOfPost(postId: string, manager: TransactionManager) {
    const postId_property: keyof PostTriple = 'postId';
    const postTriples = await this.db.collections.triples
      .where(postId_property, '==', postId)
      .get();

    await Promise.all(postTriples.docs.map((doc) => manager.delete(doc.ref)));
  }

  public async getWithPredicatesOfUser(
    userId: string,
    labelsUris: string[],
    fetchParams: FetchParams
  ) {
    const predicate_property: keyof PostTriple = 'predicate';
    const userId_property: keyof PostTriple = 'authorId';
    const createdAt_property: keyof PostTriple = 'createdAtMs';

    const base = this.db.collections.triples.where(
      userId_property,
      '==',
      userId
    );

    const filtered = (() => {
      return base.where(predicate_property, 'in', labelsUris);
    })();

    const { untilCreatedAt } = await (async () => {
      return this.db.run(async (manager) => {
        let untilCreatedAt: number | undefined;

        if (fetchParams.untilId) {
          const until = await this.get(fetchParams.untilId, manager);
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
    })) as PostTriple[];
  }
}
