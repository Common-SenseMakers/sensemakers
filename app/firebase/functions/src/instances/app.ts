import cors from 'cors';
import express from 'express';

import { authenticate } from '../middleware/authenticate';
import { errorHandling } from '../middleware/errorHandlingMiddleware';

export const app = (router?: express.Router): express.Application => {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: true,
    })
  );

  app.use(authenticate);

  if (router) {
    app.use(router);
  }

  app.use(errorHandling);

  return app;
};
