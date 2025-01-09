import { DefinedIfTrue } from '../@shared/types/types.user';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { DBInstance } from './instance';

const DEBUG = false;

export function removeUndefined<T>(obj: T): T {
  if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key]; // Delete the property if it's undefined
      } else if (typeof obj[key] === 'object') {
        removeUndefined(obj[key]); // Recurse into nested objects
      }
      // Delete empty string keys
      if (key.trim() === '') {
        delete obj[key];
      }
    }
  }
  return obj;
}

export class BaseRepository<DataType, DataCreateType> {
  constructor(
    protected collection: FirebaseFirestore.CollectionReference,
    protected db: DBInstance,
    protected idConvert?: {
      encode: (id: string) => string;
      decode: (encoded: string) => string;
    }
  ) {}

  private decode(id: string) {
    return this.idConvert ? this.idConvert.decode(id) : id;
  }

  private encode(id: string) {
    return this.idConvert ? this.idConvert.encode(id) : id;
  }

  public create(
    post: DataCreateType,
    manager: TransactionManager,
    id?: string
  ): DataCreateType & { id: string } {
    const postRef = id
      ? this.collection.doc(this.encode ? this.encode(id) : id)
      : this.collection.doc();

    if (DEBUG)
      logger.debug(`Creating ${postRef.id}`, {
        id: this.decode(postRef.id),
        post,
      });
    manager.create(postRef, removeUndefined(post));

    return {
      id: this.decode(postRef.id),
      ...post,
    };
  }

  protected getRef(id: string) {
    const ref = this.collection.doc(this.encode ? this.encode(id) : id);
    if (DEBUG) logger.debug(`Getting ${this.decode(ref.id)}`);
    return ref;
  }

  public set(id: string, data: DataType, manager: TransactionManager) {
    const ref = this.getRef(id);
    manager.set(ref, data);
  }

  protected async getDoc(id: string, manager: TransactionManager) {
    const ref = this.getRef(id);
    if (DEBUG) logger.debug(`Getting doc ${this.decode(ref.id)}`);
    return manager.get(ref);
  }

  public async getAll(): Promise<string[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this.decode(doc.id));
  }

  public async getFromIds(ids: string[]) {
    if (ids.length === 0) return [];

    const refs = Array.from(ids).map((id) => this.getRef(id));
    const snapshot = await this.db.firestore.getAll(...refs);
    return snapshot.map((doc) => {
      return { id: this.decode(doc.id), ...doc.data() } as DataType;
    });
  }

  public async exists(id: string, manager: TransactionManager) {
    const doc = await this.getDoc(id, manager);
    return doc.exists;
  }

  public async get<T extends boolean, R = DataType>(
    id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const doc = await this.getDoc(id, manager);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (!doc.exists) {
      if (DEBUG) logger.debug(`Doc dont exists ${this.decode(doc.ref.id)}`);
      if (_shouldThrow) throw new Error(`Doc ${id} not found`);
      else return undefined as DefinedIfTrue<T, R>;
    }

    return {
      id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }
}
