import { object, string } from 'yup';

export const getSparqlValidationScheme = object({
  query: string().required(),
}).noUnknown(true);
