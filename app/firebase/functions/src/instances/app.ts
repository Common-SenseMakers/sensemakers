import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import express from 'express';

import { attachServices } from '../middleware/attach.services';
import { errorHandling } from '../middleware/errorHandlingMiddleware';
import { ClerkConfig } from './services';

export const buildApp = (
  clerk: () => ClerkConfig,
  router?: express.Router
): express.Application => {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: true,
    })
  );

  app.use(attachServices);
  app.use((req, res, next) => {
    const clerkConfig = clerk();
    clerkMiddleware(clerkConfig)(req, res, next);
  });

  if (router) {
    app.use(router);
  }

  app.use(errorHandling);

  return app;
};

export const buildAdminApp = (
  clerk: () => ClerkConfig,
  router?: express.Router
): express.Application => {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: true,
    })
  );

  app.use(attachServices);
  app.use((req, res, next) => {
    const clerkConfig = clerk();
    clerkMiddleware(clerkConfig)(req, res, next);
  });

  if (router) {
    app.use(router);
  }

  app.use(errorHandling);

  return app;
};
