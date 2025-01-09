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
    const {
      db,
      postsManager,
      links,
      ontology: ontologyService,
    } = getServices(request);

    const { refOEmbed, refLabels, ontology } = await db.run(async (manager) => {
      const refOEmbed = await links.getOEmbed(queryParams.ref, manager);

      const refLabels =
        await postsManager.processing.posts.getAggregatedRefLabels(
          queryParams.ref,
          manager
        );

      const ontology = await ontologyService.getMany(
        refLabels.map((l) => l.label),
        manager
      );

      return { refOEmbed, refLabels, ontology };
    });

    const refDisplayMeta: RefDisplayMeta = {
      oembed: refOEmbed,
      aggregatedLabels: refLabels,
      ontology,
    };

    if (DEBUG)
      logger.debug(`${request.path}: refDisplayMeta`, { refDisplayMeta });
    response.status(200).send({ success: true, data: refDisplayMeta });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
