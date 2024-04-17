import { DefinedIfTrue } from '../@shared/types/types';
import { TransactionManager } from '../db/transaction.manager';

export class BaseRepository<TT, CC> {
  constructor(protected collection: FirebaseFirestore.CollectionReference) {}

  public create(post: CC, manager: TransactionManager): CC & { id: string } {
    const postRef = this.collection.doc();
    manager.create(postRef, post);

    return {
      id: postRef.id,
      ...post,
    };
  }

  protected getRef(postId: string) {
    const ref = this.collection.doc(postId);
    return ref;
  }

  protected async getDoc(userId: string, manager: TransactionManager) {
    const ref = this.getRef(userId);
    return manager.get(ref);
  }

  public async get<T extends boolean, R = TT>(
    id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const doc = await this.getDoc(id, manager);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (!doc.exists) {
      if (_shouldThrow) throw new Error(`PlatformPost ${id} not found`);
      else return undefined as DefinedIfTrue<T, R>;
    }

    return {
      id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }
}
