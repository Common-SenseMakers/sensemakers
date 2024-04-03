import { ApiResponseError } from 'twitter-api-v2';

export const handleTwitterError = (e: ApiResponseError) => {
  return `
    Error calling Twitter API. 
    path: ${e.request.path}
    code: ${e.code}
    data: ${JSON.stringify(e.data)}
    `;
};
