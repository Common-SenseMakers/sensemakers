import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import express from 'express';

import { attachServices } from '../middleware/attach.services';
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
  app.use(clerkMiddleware());

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
  app.use(clerkMiddleware());

  if (router) {
    app.use(router);
  }

  app.use(errorHandling);

  return app;
};
