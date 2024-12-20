import cors from 'cors';
import express from 'express';

import { attachServices } from '../middleware/attach.services';
import { authenticate, authenticateAdmin } from '../middleware/authenticate';
import { errorHandling } from '../middleware/errorHandlingMiddleware';

export const buildApp = (router?: express.Router): express.Application => {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: true,
    })
  );

  app.use(attachServices);
  app.use(authenticate);

  if (router) {
    app.use(router);
  }

  app.use(errorHandling);

  return app;
};

export const buildAdminApp = (router?: express.Router): express.Application => {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: true,
    })
  );

  app.use(attachServices);
  app.use(authenticateAdmin);
  app.use(authenticate);

  if (router) {
    app.use(router);
  }

  app.use(errorHandling);

  return app;
};
