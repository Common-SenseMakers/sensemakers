import * as crypto from 'crypto';
import { OEmbed } from '../@shared/types/types.parser';
import { DBInstance } from '../db/instance';
import { BaseRepository, removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { decodeId, encodeId } from '../users/users.utils';
import { DefinedIfTrue } from '../@shared/types/types.user';

function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

export class LinksRepository extends BaseRepository<OEmbed, OEmbed> {
  constructor(protected db: DBInstance) {
    super(db.collections.links, db, {
      decode: decodeId,
      encode: encodeId,
    });
  }

  /**  creates an OEmbed link entry using normalized_url hash as ID */
  public create(
    oembed: OEmbed,
    manager: TransactionManager,
  ) {
    if (!oembed.normalized_url) {
      throw new Error('OEmbed must have a normalized_url');
    }

    const id = hashUrl(oembed.normalized_url);
    const linkRef = this.db.collections.links.doc(this.encode(id));

    manager.create(linkRef, removeUndefined(oembed));

    return {
      id: this.decode(linkRef.id),
      ...oembed,
    };
  }

  protected async getRef(
    linkId: string,
    manager: TransactionManager,
    onlyIfExists: boolean = false
  ) {
    const ref = this.db.collections.links.doc(this.encode(linkId));
    if (onlyIfExists) {
      const doc = await this.getDoc(linkId, manager);

      if (!doc.exists) {
        throw new Error(`Link ${linkId} not found`);
      }
    }

    return ref;
  }

  protected async getDoc(linkId: string, manager: TransactionManager) {
    const ref = await this.getRef(linkId, manager);
    return manager.get(ref);
  }

  public async getByLinkId<T extends boolean>(
    linkId: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, OEmbed>> {
    const doc = await this.getDoc(linkId, manager);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    const data = doc.data();
    if (!doc.exists || !data || Object.keys(data).length === 0) {
      if (_shouldThrow) throw new Error(`Link ${linkId} not found`);
      else return undefined as DefinedIfTrue<T, OEmbed>;
    }

    return {
      id: this.decode(doc.id),
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, OEmbed>;
  }

  public async getByUrl<T extends boolean>(
    url: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const url_property: keyof OEmbed = 'url';
    
    const query = this.db.collections.links.where(url_property, '==', url);
    const snap = await manager.query(query);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (snap.empty) {
      if (_shouldThrow) throw new Error(`Link with url: ${url} not found`);
      else return undefined as DefinedIfTrue<T, OEmbed>;
    }

    if (snap.size > 1) {
      throw new Error(
        `Data corrupted. Unexpected multiple links with the same url ${url}`
      );
    }

    return {
      id: this.decode(snap.docs[0].id),
      ...snap.docs[0].data(),
    } as DefinedIfTrue<T, OEmbed>;
  }
}
