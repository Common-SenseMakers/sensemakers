import { ClusterInstance } from '../@shared/types/types.clusters';
import { RefMeta } from '../@shared/types/types.parser';
import {
  LinkMeta,
  LinkSource,
  OEmbed,
  RefDisplayMeta,
  RefLabel,
} from '../@shared/types/types.references';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { SCIENCE_TOPIC_URI } from '../@shared/utils/semantics.helper';
import { ClustersService } from '../clusters/clusters.service';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { OntologiesService } from '../ontologies/ontologies.service';
import { IndexedPostsRepo } from '../posts/indexed.posts.repository';
import { TimeService } from '../time/time.service';
import { LinksRepository } from './links.repository';
import { hashUrl } from './links.utils';

export interface LinksMockConfig {
  get: boolean;
  enable?: boolean;
}

export interface LinksConfig {
  apiUrl: string;
  apiKey: string;
}

export class LinksService {
  constructor(
    protected clusters: ClustersService,
    public links: LinksRepository,
    protected time: TimeService,
    protected ontology: OntologiesService,
    protected config: LinksConfig
  ) {}

  async fetchOEmbed(
    url: string
  ): Promise<{ success: boolean; oembed?: OEmbed }> {
    try {
      const res = await fetch(
        `${this.config.apiUrl}/oembed?url=${encodeURIComponent(url)}&api_key=${this.config.apiKey}`,
        {
          headers: [['Content-Type', 'application/json']],
          method: 'get',
        }
      );
      const resJson = await res.json();
      if (resJson.status === 403) {
        return {
          success: false,
        };
      }
      const resData = resJson as OEmbed;
      const oembed = { ...resData, original_url: url, url };
      return { success: true, oembed };
    } catch (e) {
      logger.warn(`Error fetching ref ${url} meta: ${e}`);
      return { success: false };
    }
  }

  async getByUrl<T extends boolean>(
    url: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const urlHash = hashUrl(url);
    return this.links.get(urlHash, manager, shouldThrow);
  }

  setByUrl(url: string, newLinkMeta: LinkMeta, manager: TransactionManager) {
    const urlHash = hashUrl(url);
    this.links.set(urlHash, newLinkMeta, manager);
  }

  async refreshOEmbed(
    url: string,
    manager: TransactionManager,
    refMetaOrg?: RefMeta
  ) {
    const iframely = await this.fetchOEmbed(url);
    const originalRefMeta =
      refMetaOrg &&
      removeUndefined<RefMeta>({
        title: refMetaOrg.title,
        summary: refMetaOrg.summary,
        description: refMetaOrg.summary,
        url: refMetaOrg.url,
      });

    const oembed: OEmbed = {
      ...(originalRefMeta as RefMeta),
      ...iframely.oembed,
    };

    /** parser decides type */
    oembed.type = refMetaOrg?.item_type;

    this.setByUrl(
      url,
      {
        oembed: removeUndefined(oembed),
        sources: {
          [LinkSource.parser]: {
            timestamp: this.time.now(),
            status: 'SUCCESS',
          },
          [LinkSource.iframely]: {
            timestamp: this.time.now(),
            status: iframely.success ? 'SUCCESS' : 'ERROR',
          },
        },
      },
      manager
    );

    return oembed;
  }

  async getOEmbed(
    url: string,
    manager: TransactionManager,
    refMetaOrg?: RefMeta
  ): Promise<OEmbed> {
    const existing = await this.getByUrl(url, manager);

    /** refetch from iframely links that have not been fetched */
    if (existing && existing.sources && existing.sources[LinkSource.iframely]) {
      const newOembed = {
        ...existing.oembed,
        type: refMetaOrg?.item_type,
      };
      return newOembed;
    }

    const newOembed = await this.refreshOEmbed(url, manager, refMetaOrg);
    return newOembed;
  }

  public async getAggregatedRefLabels(
    reference: string,
    cluster: ClusterInstance,
    manager: TransactionManager
  ): Promise<RefLabel[]> {
    const refLabels: RefLabel[] = [];

    // Get all posts for reference from their respective subcollections
    const refId = hashUrl(reference);
    const indexedRepo = new IndexedPostsRepo(
      cluster.collection(CollectionNames.Refs)
    );

    const refPosts = await indexedRepo.getAllPosts(refId, manager);

    // Process each post's labels directly from the subcollection documents
    refPosts.forEach((refPost) => {
      if (
        refPost?.structuredSemantics?.labels &&
        refPost.structuredSemantics.topic === SCIENCE_TOPIC_URI
      ) {
        const thisRefLabels = refPost.structuredSemantics?.labels?.map(
          (label): RefLabel => ({
            label,
            postId: refPost.id,
            authorProfileId: refPost.authorProfileId,
          })
        );
        refLabels.push(...thisRefLabels);
      }
    });

    return refLabels;
  }

  async getAggregatedRefLabelsForDisplay(
    ref: string,
    manager: TransactionManager,
    clusterId?: string
  ) {
    const cluster = this.clusters.getInstance(clusterId);
    const refOEmbed = await this.getOEmbed(ref, manager);
    const refLabels = await this.getAggregatedRefLabels(ref, cluster, manager);

    const ontology = await this.ontology.getMany(
      refLabels.map((l) => l.label),
      manager
    );

    const refDisplayMeta: RefDisplayMeta = {
      aggregatedLabels: refLabels,
      ontology,
      oembed: refOEmbed,
    };

    return refDisplayMeta;
  }
}
