import { RequestHandler } from 'express';
import { object, string } from 'yup';

import { getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';

export const getPublicUserSchema = object({
  userId: string().required(),
});

export const getUserController: RequestHandler = async (request, response) => {
  try {
    const services = getServices(request);

    const payload = (await getPublicUserSchema.validate(request.body)) as {
      userId: string;
    };

    const user = await services.db.run((manager) =>
      services.users.getPublicUserWithProfiles(payload.userId, manager)
    );

    response.status(200).send({
      success: true,
      data: user,
    });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
