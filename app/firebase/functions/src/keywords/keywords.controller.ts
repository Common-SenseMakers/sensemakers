import { RequestHandler } from 'express';
import { object, string } from 'yup';

const DEBUG = true;

export const getRefSchema = object({
  ref: string().required(),
});

export const getRefMetaController: RequestHandler = async (
  request,
  response
) => {
  try {
  } catch (error: any) {}
};
