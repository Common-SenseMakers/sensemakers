import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';
import { logger } from 'firebase-functions/v1';

import { NANOPUBS_SPARQL_SERVER } from '../config/config';

const sparql = new SparqlEndpointFetcher({
  method: 'POST',
  timeout: 5000,
});

export const fetchSparql = (query: string) => {
  return new Promise(async (resolve, reject) => {
    const fetcher = await sparql.fetchBindings(NANOPUBS_SPARQL_SERVER, query);
    const data: any[] = [];

    fetcher.on('data', (bindings) => {
      data.push(bindings);
    });

    fetcher.on('end', () => {
      logger.debug('ended getting query');
      resolve(data);
    });

    fetcher.on('error', (error) => {
      // Handle any errors that occur during the fetch
      reject(error);
    });
  });
};
