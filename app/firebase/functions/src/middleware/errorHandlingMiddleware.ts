import express from 'express';
import { createErrorResponse } from './createErrorResponse';

export const errorHandling = async (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  createErrorResponse(req, res, err);
  next();
};
