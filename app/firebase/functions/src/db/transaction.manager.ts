import {
  DocumentReference,
  DocumentSnapshot,
  PartialWithFieldValue,
  Precondition,
  Query,
  QuerySnapshot,
  SetOptions,
  Timestamp,
  Transaction,
  UpdateData,
  WithFieldValue,
  WriteBatch,
} from 'firebase-admin/firestore';
import { merge } from 'lodash';

export interface TransactionCreate<T = any> {
  documentRef: DocumentReference<T>;
  data: WithFieldValue<T>;
}

export interface TransactionSet<T = any> {
  documentRef: DocumentReference<T>;
  data: PartialWithFieldValue<T>;
  options?: SetOptions;
}

export interface TransactionUpdate<T = any> {
  documentRef: DocumentReference<T>;
  data: UpdateData<T>;
  precondition?: Precondition;
}

export interface TransactionDelete<T = any> {
  documentRef: DocumentReference<T>;
  precondition?: Precondition;
}
enum MutationType {
  create = 'CREATE',
  set = 'SET',
  update = 'UPDATE',
  delete = 'DELETE',
}

export interface Mutation<T = any, D = any> {
  type: MutationType;
  documentRef: DocumentReference<T>;
  data?: D;
  options?: SetOptions;
  precondition?: Precondition;
}

/**
 * An interface that is common to the Transaction and WriteBatch types
 * in firestore
 */
export interface Mutator {
  get<T>(documentRef: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  create<T>(documentRef: DocumentReference<T>, data: WithFieldValue<T>): void;
  set<T>(
    documentRef: DocumentReference<T>,
    data: PartialWithFieldValue<T>,
    options: SetOptions
  ): void;
  set<T>(documentRef: DocumentReference<T>, data: WithFieldValue<T>): void;
  update<T>(
    documentRef: DocumentReference<T>,
    data: UpdateData<T>,
    precondition?: Precondition
  ): void;
  delete(
    documentRef: DocumentReference<any>,
    precondition?: Precondition
  ): void;
}

/** batches db writes to occur after all reads were done */
export class TransactionManager {
  /** an array of all the  */
  private mutations: Map<string, Mutation[]> = new Map();

  constructor(
    readonly transaction?: Transaction,
    readonly batch?: WriteBatch
  ) {}

  now() {
    return new Timestamp(Math.round(Date.now() / 1000), 0);
  }

  /**
   * Created and modified documents are hot cached by the manager to
   * allow for reads after they have been created/modified
   *
   * The cached object overwrites the properties of the object in firestore. The final result
   * of get will be an object with all the properties
   */
  private getCumMutationOf(id: string) {
    const mutations = this.mutations.get(id);
    if (!mutations) return undefined;

    /** merge all mutations data */
    const obj = mutations.reduce((_obj, mut) => {
      switch (mut.type) {
        case MutationType.create:
        case MutationType.set:
        case MutationType.update:
          merge(_obj, mut.data);
          break;

        case MutationType.delete:
          return {};
      }

      return _obj;
    }, {});

    return obj;
  }

  async mutate<D>(documentRef: DocumentReference<any>, mutation: Mutation<D>) {
    const current = this.mutations.get(documentRef.id) || [];
    current.push(mutation);
    return this.mutations.set(documentRef.id, current);
  }

  async get<T>(
    documentRef: DocumentReference<T>
  ): Promise<DocumentSnapshot<T>> {
    const cached = this.getCumMutationOf(documentRef.id);
    const onFirestore = this.transaction
      ? await this.transaction.get(documentRef)
      : await documentRef.get();

    const mergedData = cached
      ? merge(onFirestore.data(), cached)
      : onFirestore.data();

    return {
      id: documentRef.id,
      ref: documentRef,
      exists: cached !== undefined || onFirestore.exists,
      readTime: this.now(),
      data: () => mergedData,
      get: () => {
        throw new Error('not implemented');
      },
      isEqual: () => {
        throw new Error('not implemented');
      },
    };
  }

  /** queries cannot be cached, so the always hit firestore. This
   * method 'query', different from 'get' must be used to query
   */
  query<T>(query: Query<T>): Promise<QuerySnapshot<T>> {
    return this.transaction ? this.transaction.get(query) : query.get();
  }

  create(documentRef: DocumentReference<any>, data: WithFieldValue<any>): void {
    this.mutate(documentRef, {
      type: MutationType.create,
      documentRef,
      data,
    });
  }

  set(
    documentRef: DocumentReference<any>,
    data: PartialWithFieldValue<any>,
    options?: SetOptions
  ): void {
    this.mutate(documentRef, {
      type: MutationType.set,
      documentRef,
      data,
      options,
    });
  }

  update(
    documentRef: DocumentReference<any>,
    data: UpdateData<any>,
    precondition?: Precondition
  ): void {
    this.mutate(documentRef, {
      type: MutationType.update,
      documentRef,
      data,
      precondition,
    });
  }

  delete(
    documentRef: DocumentReference<any>,
    precondition?: Precondition
  ): void {
    this.mutate(documentRef, {
      type: MutationType.delete,
      documentRef,
      precondition,
    });
  }

  get mutator(): Mutator {
    if (this.transaction) {
      return this.transaction;
    }
    if (this.batch) {
      return this.batch as unknown as Mutator;
    }

    throw new Error('Either transaction or bath need to be defined');
  }

  async applyWrites(): Promise<void> {
    /** apply all writes of different element concurrently */

    this.mutations.forEach((mutations) => {
      /** apply writes of one element sequentially */
      for (const mut of mutations) {
        switch (mut.type) {
          case MutationType.create:
            this.mutator.create(mut.documentRef, mut.data);
            break;

          case MutationType.set:
            mut.options
              ? this.mutator.set(mut.documentRef, mut.data, mut.options)
              : this.mutator.set(mut.documentRef, mut.data);
            break;

          case MutationType.update:
            if (Object.keys(mut.data).length === 0) {
              break;
            }

            mut.precondition
              ? this.mutator.update(mut.documentRef, mut.data, mut.precondition)
              : this.mutator.update(mut.documentRef, mut.data);
            break;

          case MutationType.delete:
            mut.precondition
              ? this.mutator.delete(mut.documentRef, mut.precondition)
              : this.mutator.delete(mut.documentRef);
            break;
        }
      }
    });

    if (this.batch) {
      await this.batch.commit();
    }
  }
}

export type HandleWithTxManager<R = void, P = void> = (
  manager: TransactionManager,
  payload?: P
) => Promise<R>;

export enum ManagerModes {
  /** batch all writes until after the function call */
  BATCH = 'BATCH',
  /** snapshot reads at function start and batch all writes until after the function call */
  TRANSACTION = 'TRANSACTION',
}

export interface ManagerConfig {
  mode: ManagerModes;
}
