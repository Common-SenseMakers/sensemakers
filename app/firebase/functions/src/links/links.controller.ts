import { RequestHandler } from 'express';
import { object, string } from 'yup';

import { OEmbed, RefMeta } from '../@shared/types/types.parser';
import { PostsQueryDefined } from '../@shared/types/types.posts';
import { getServices } from '../controllers.utils';
import { logger } from '../instances/logger';

const DEBUG = true;

export const getRefSchema = object({
  ref: string().required(),
});

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getRefMetaController: RequestHandler = async (
  request,
  response
) => {
  try {
    const queryParams = (await getRefSchema.validate(request.body)) as {
      ref: string;
    };

    logger.debug(`${request.path} - query parameters`, { queryParams });
    const { db, postsManager } = getServices(request);

    const getManyQueryParams: PostsQueryDefined = {
      fetchParams: {
        expectedAmount: 1,
      },
      semantics: { refs: [queryParams.ref] },
    };
    const posts =
      await postsManager.processing.posts.getMany(getManyQueryParams);
    if (posts.length === 0) {
      throw new Error(`No posts found for ref ${queryParams.ref}`);
    }
    const postsFull = await Promise.all(
      posts.map((post) =>
        db.run((manager) =>
          postsManager.processing.hydratePostFull(post, true, true, manager)
        )
      )
    );
    const refPost = postsFull[0];
    const refMeta =
      refPost.originalParsed?.support?.refs_meta?.[queryParams.ref];
    const refData: RefMeta = {
      url: queryParams.ref,
      title: refMeta?.title,
      summary: refMeta?.summary,
      refLabels: refPost.meta?.refLabels[queryParams.ref],
    };

    if (DEBUG) logger.debug(`${request.path}: refData`, { refData });
    response.status(200).send({ success: true, data: refData });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
