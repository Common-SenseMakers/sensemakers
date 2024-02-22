import express from 'express';

import { STATUS_CODES } from '../config/STATUS_CODES';
import { logger } from '../instances/logger';

export interface IErrorResponse {
  error: string;
  errorId?: string;
  errorName?: string;
  errorCode?: string;
  errorMessage?: string;
  request?: any;
  data?: any;
}

export const createErrorResponse = (
  req: express.Request,
  res: express.Response,
  error: any
): void => {
  logger.info(`Error occurred at ${req.path}`);

  // Here `error instanceof CommonError` does not work for some
  // strange reason so for now we can assume that if the error
  // has errorId it is CommonError
  if (error.errorId) {
    const errorResponse: IErrorResponse = {
      error: error.message,
      errorName: error.name,
      errorId: error.errorId,
      errorCode: error.errorCode,
      errorMessage: error.userMessage,
      request: {
        id: (req as any).requestId,
        body: req.body,
        query: req.query,
        headers: req.headers,
      },
      data: error.data,
    };

    const statusCode = error.statusCode || STATUS_CODES.InternalServerError;

    logger.info(
      `Creating error response with message '${error.message}' for error (${
        error.errorId || 'No id available'
      }) occurred in request ${(req as any).requestId}`
    );

    logger.error('Error occurred', {
      error,
    });

    res.status(statusCode).json(errorResponse);
  } else {
    logger.warn(
      `The error passed to createErrorResponse was not of CommonError type. This should never happen!`,
      {
        payload: error,
      }
    );

    res
      .status(STATUS_CODES.InternalServerError)
      .send(error?.message || error || 'Something bad happened');
  }
};
