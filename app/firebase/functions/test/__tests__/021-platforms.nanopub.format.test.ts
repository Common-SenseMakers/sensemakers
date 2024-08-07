import { Nanopub } from '@nanopub/sign';
import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.user';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { cleanPublicKey } from '../../src/@shared/utils/semantics.helper';
import { logger } from '../../src/instances/logger';
import { buildAppIntroNp } from '../../src/platforms/nanopub/create.app.intro.nanopub';
import { createIntroNanopublication } from '../../src/platforms/nanopub/create.intro.nanopub';
import { createNanopublication } from '../../src/platforms/nanopub/create.nanopub';
import { NanopubService } from '../../src/platforms/nanopub/nanopub.service';
import { TimeService } from '../../src/time/time.service';
import { getNanopubProfile } from '../utils/nanopub.profile';
import { getMockPost } from '../utils/posts.utils';
import { getMockedUser } from '../utils/users.mock';

const DEBUG = false;

describe('nanopublication format', () => {
  it('publishes a correctly formatted mock nanopub to the test server and updates it', async () => {
    const post = getMockPost({
      authorId: 'test-user-id',
      id: 'post-id-1',
      semantics: `
        @prefix ns1: <http://purl.org/spar/cito/> .
        @prefix schema: <https://schema.org/> .
        
        <http://purl.org/nanopub/temp/mynanopub#assertion> 
          ns1:discusses <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
          ns1:includesQuotationFrom <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
          schema:keywords "ExternalSecurity",        "Geopolitics",        "Israel",        "Kissinger",        "PoliticalScience",        "Security" .
        `,
    });
    const mockUser = getMockedUser({
      userId: 'test-user-id',
      [PLATFORM.Nanopub]: {
        ethPrivateKey: '0xprivate',
      },
      [PLATFORM.Twitter]: {
        id: '123456',
        username: 'test-user',
        password: 'test-password',
        type: 'read',
      },
    });
    const rsaKeys = getRSAKeys('');
    const nanopub = await new NanopubService(new TimeService(), {
      servers: JSON.parse(process.env.NANOPUBS_PUBLISH_SERVERS as string),
      rsaKeys: {
        privateKey: process.env.NP_PUBLISH_RSA_PRIVATE_KEY as string,
        publicKey: process.env.NP_PUBLISH_RSA_PUBLIC_KEY as string,
      },
    }).convertFromGeneric({
      post,
      author: mockUser,
    });

    if (!nanopub || !nanopub.unsignedPost) {
      throw new Error('Post not created');
    }

    if (!nanopub) {
      throw new Error('Post not created');
    }

    if (!rsaKeys) {
      throw new Error('RSA keys not created');
    }

    const signed = await signNanopublication(nanopub.unsignedPost, rsaKeys, '');
    expect(signed).to.not.be.undefined;
    const nanopubServer = (
      JSON.parse(process.env.NANOPUBS_PUBLISH_SERVERS as string) as string[]
    )[0];
    if (!nanopubServer) {
      throw new Error('Nanopub server not defined');
    }

    const published: Nanopub = await signed.publish(undefined, nanopubServer);

    expect(published).to.not.be.undefined;
    if (DEBUG) logger.debug('published at: ', published.info().published);
    const fetchedPub = (await Nanopub.fetch(
      published.info().published
    )) as Nanopub;
    expect(fetchedPub).to.not.be.undefined;

    /** update the nanopublication */
    const updatedNanopub = await createNanopublication(
      post,
      mockUser,
      fetchedPub.info().published
    );
    const updatedSigned = await signNanopublication(
      updatedNanopub.rdf(),
      rsaKeys,
      ''
    );

    const updatedPublished: Nanopub = await updatedSigned.publish(
      undefined,
      nanopubServer
    );
    expect(updatedPublished).to.not.be.undefined;
    if (DEBUG)
      logger.debug('update published at: ', updatedPublished.info().published);
    const fetchedUpdatedPub = (await Nanopub.fetch(
      updatedPublished.info().published
    )) as Nanopub;
    expect(fetchedUpdatedPub).to.not.be.undefined;
  });

  it('publishes a correctly formatted mock intronanopub to the test server', async () => {
    const address =
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    const { profile, rsaKeys } = await getNanopubProfile(address);
    const introNanopub = await createIntroNanopublication(profile, true);

    if (!introNanopub) {
      throw new Error('Post not created');
    }

    const signed = await signNanopublication(introNanopub.rdf(), rsaKeys, '');
    expect(signed).to.not.be.undefined;
    const nanopubServer = (
      JSON.parse(process.env.NANOPUBS_PUBLISH_SERVERS as string) as string[]
    )[0];
    if (!nanopubServer) {
      throw new Error('Nanopub server not defined');
    }

    const published: Nanopub = await signed.publish(undefined, nanopubServer);

    expect(published).to.not.be.undefined;
    if (DEBUG) logger.debug('published at: ', published.info().published);
    const fetchedPub = (await Nanopub.fetch(
      published.info().published
    )) as Nanopub;
    expect(fetchedPub).to.not.be.undefined;

    /** update the intro nanopublication */
    const updatedIntroNanopub = await createIntroNanopublication(
      profile,
      true,
      published.info().published
    );

    if (!updatedIntroNanopub) {
      throw new Error('Post not created');
    }

    const updatedSigned = await signNanopublication(
      updatedIntroNanopub.rdf(),
      rsaKeys,
      ''
    );
    expect(updatedSigned).to.not.be.undefined;

    const updatedPublished: Nanopub = await updatedSigned.publish(
      undefined,
      nanopubServer
    );

    expect(updatedPublished).to.not.be.undefined;
    if (DEBUG)
      logger.debug('update published at: ', updatedPublished.info().published);
    const updatedFetchedPub = (await Nanopub.fetch(
      updatedPublished.info().published
    )) as Nanopub;
    expect(updatedFetchedPub).to.not.be.undefined;
  });

  it('publishes a correctly formatted mock app intro nanopub to the test server', async () => {
    const address1 =
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const address2 =
      '0xac0974bec38b27e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    const { profile: profile1, rsaKeys: rsaKeys1 } =
      await getNanopubProfile(address1);
    const { profile: profile2, rsaKeys: rsaKeys2 } =
      await getNanopubProfile(address2);
    const appIntroNp = await buildAppIntroNp(
      profile1.ethAddress,
      profile2.ethAddress,
      cleanPublicKey(rsaKeys1),
      cleanPublicKey(rsaKeys2),
      profile1.ethToRsaSignature,
      profile2.ethToRsaSignature
    );

    if (!appIntroNp) {
      throw new Error('Nanopub not constructed');
    }

    const signed = await signNanopublication(appIntroNp.rdf(), rsaKeys1, '');
    expect(signed).to.not.be.undefined;
    const nanopubServer = (
      JSON.parse(process.env.NANOPUBS_PUBLISH_SERVERS as string) as string[]
    )[0];
    if (!nanopubServer) {
      throw new Error('Nanopub server not defined');
    }

    const published: Nanopub = await signed.publish(undefined, nanopubServer);

    expect(published).to.not.be.undefined;
    if (DEBUG) logger.debug('published at: ', published.info().published);
    const fetchedPub = (await Nanopub.fetch(
      published.info().published
    )) as Nanopub;
    expect(fetchedPub).to.not.be.undefined;

    /** update the intro nanopublication */
    const updatedAppIntroNp = await buildAppIntroNp(
      profile1.ethAddress,
      profile2.ethAddress,
      cleanPublicKey(rsaKeys1),
      cleanPublicKey(rsaKeys2),
      profile1.ethToRsaSignature,
      profile2.ethToRsaSignature,
      published.info().published
    );

    if (!updatedAppIntroNp) {
      throw new Error('Nanopub not constructed');
    }

    const updatedSigned = await signNanopublication(
      updatedAppIntroNp.rdf(),
      rsaKeys1,
      ''
    );
    expect(updatedSigned).to.not.be.undefined;

    const updatedPublished: Nanopub = await updatedSigned.publish(
      undefined,
      nanopubServer
    );

    expect(updatedPublished).to.not.be.undefined;
    if (DEBUG)
      logger.debug('update published at: ', updatedPublished.info().published);
    const updatedFetchedPub = (await Nanopub.fetch(
      updatedPublished.info().published
    )) as Nanopub;
    expect(updatedFetchedPub).to.not.be.undefined;
  });
});
