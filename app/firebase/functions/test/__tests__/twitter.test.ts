import { expect } from 'chai';
import { logger } from 'firebase-functions/v1';

import { services } from '../../src/services';

describe('twitter', () => {
  let userId: string;

  before(async () => {
    /** create a dumb user using orcid */
    userId = await services.users.create({
      orcid: {
        name: 'Test User',
        orcid: '0000-0000-0000-1234',
      },
    });
  });

  /** get twitter authLink */
  it('getAuthLink', async () => {
    const link = await services.twitter.getAuthLink(userId);
    logger.log(`link: ${link}`);
    expect(link).to.not.be.undefined;
  });
});
