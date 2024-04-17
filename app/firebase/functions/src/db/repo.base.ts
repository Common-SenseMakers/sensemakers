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

  /** Get the platform post from the published post_id */
  public async getFrom_post_id<T extends boolean, R = TT>(
    post_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    const posts = await manager.query(
      this.collection.where('posted.post_id', '==', post_id)
    );

    if (posts.empty) {
      if (_shouldThrow) throw new Error(`User ${post_id} not found`);
      else return undefined as DefinedIfTrue<T, R>;
    }

    const doc = posts.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }

  protected async getRef(
    postId: string,
    manager: TransactionManager,
    shouldThrow: boolean = false
  ) {
    const ref = this.collection.doc(postId);
    if (shouldThrow) {
      await this.getDoc(postId, manager, true);
    }

    return ref;
  }

  protected async getDoc(
    userId: string,
    manager: TransactionManager,
    shouldThrow: boolean = false
  ) {
    const ref = await this.getRef(userId, manager, shouldThrow);
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
