import { RequestHandler } from 'express';
import { object, string } from 'yup';

import { RefDisplayMeta } from '../@shared/types/types.references';
import { getServices } from '../controllers.utils';
import { logger } from '../instances/logger';

const DEBUG = true;

export const getRefSchema = object({
  ref: string().required(),
});

export const getRefMetaController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getRefSchema.validate(request.body)) as {
      ref: string;
    };

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const { db, postsManager, links } = getServices(request);

    const { refOEmbed, refPost } = await db.run(async (manager) => {
      const refPosts = await links.getRefPosts(queryParams.ref, manager);
      if (refPosts.length === 0) {
        throw new Error(`No posts found for ref ${queryParams.ref}`);
      }
      const refPost = await postsManager.processing.posts.get(
        refPosts[0].id,
        manager
      );
      if (!refPost) {
        throw new Error(`No post found for ref ${queryParams.ref}`);
      }
      const refMetaOrg = refPost.originalParsed?.support?.refs_meta
        ? refPost.originalParsed.support.refs_meta[queryParams.ref]
        : undefined;
      const refOEmbed = await links.getOEmbed(
        queryParams.ref,
        manager,
        refMetaOrg
      );
      return { refOEmbed, refPost };
    });
    const refLabels =
      await postsManager.processing.posts.getAggregatedRefLabels([
        queryParams.ref,
      ]);

    const refDisplayMeta: RefDisplayMeta = {
      oembed: refOEmbed,
      aggregatedLabels: refLabels[queryParams.ref],
      ontology: refPost.originalParsed?.support?.ontology,
    };

    if (DEBUG)
      logger.debug(`${request.path}: refDisplayMeta`, { refDisplayMeta });
    response.status(200).send({ success: true, data: refDisplayMeta });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
