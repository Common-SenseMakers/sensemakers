import { Nanopub } from '@nanopub/sign';
import { expect } from 'chai';

import {
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { cleanPublicKey } from '../../src/@shared/utils/semantics.helper';
import { logger } from '../../src/instances/logger';
import { buildAppIntroNp } from '../../src/platforms/nanopub/create.app.intro.nanopub';
import { createIntroNanopublication } from '../../src/platforms/nanopub/create.intro.nanopub';
import { createNanopublication } from '../../src/platforms/nanopub/create.nanopub';
import { NanopubService } from '../../src/platforms/nanopub/nanopub.service';
import { buildIntroNp } from '../../src/platforms/nanopub/nanopub.utils';
import { TimeService } from '../../src/time/time.service';
import { getNanopubProfile } from '../utils/nanopub.profile';
import { getMockPost } from '../utils/posts.utils';
import { getMockedUserRead } from '../utils/users.mock';

const DEBUG = true;
const PUBLISH = true;

describe.skip('nanopublication format', () => {
  it('publishes a correctly formatted mock nanopub to the test server and updates it', async () => {
    const post = getMockPost(
      {
        authorUserId: 'test-user-id',
        id: 'post-id-1',
        semantics: `
        @prefix ns1: <http://purl.org/spar/cito/> .
        @prefix schema: <https://schema.org/> .
        
        <http://purl.org/nanopub/temp/mynanopub#assertion> 
          ns1:discusses <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
          ns1:includesQuotationFrom <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
          schema:keywords "ExternalSecurity",        "Geopolitics",        "Israel",        "Kissinger",        "PoliticalScience",        "Security" .
        `,
      },
      PLATFORM.Twitter
    );
    const mockUser = getMockedUserRead({
      userId: 'test-user-id',
      [PLATFORM.Nanopub]: {
        ethPrivateKey: '0xprivate',
      },
      [PLATFORM.Twitter]: {
        id: '123456',
        username: 'test-user-twitter',
        password: 'test-password',
        type: 'read',
      },
      [PLATFORM.Mastodon]: {
        id: '123456',
        username: 'test-username-mastodon',
        accessToken: 'test-access',
        mastodonServer: 'test-server.com',
      },
      [PLATFORM.Bluesky]: {
        id: '123456',
        username: 'test-username-bluesky',
        name: 'test-user-bluesky',
        appPassword: 'test-app-password',
      },
    });
    const rsaKeys = getRSAKeys('');
    // const userRead = await services.db.run((manager) => {
    //   if (!user) {
    //     throw new Error('user not created');
    //   }
    //   return services.users.getUserWithProfiles(user.userId, manager);
    // });
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

    const published: Nanopub = await (async () => {
      if (!PUBLISH) {
        return signed;
      }
      return await signed.publish(undefined, nanopubServer);
    })();

    expect(published).to.not.be.undefined;
    if (DEBUG)
      logger.debug('published at: ', {
        published: published.info().published,
        rdf: published.rdf(),
      });
    if (PUBLISH) {
      const fetchedPub = (await Nanopub.fetch(
        published.info().published
      )) as Nanopub;
      expect(fetchedPub).to.not.be.undefined;
    }

    /** update the nanopublication */
    const updatedPost = getMockPost(
      {
        authorUserId: 'test-user-id',
        id: 'post-id-1',
        semantics: `
        @prefix ns1: <http://purl.org/spar/cito/> .
        @prefix schema: <https://schema.org/> .
        
        <http://purl.org/nanopub/temp/mynanopub#assertion> 
          ns1:discusses <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
          ns1:includesQuotationFrom <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
          schema:keywords "ExternalSecurity",        "Geopolitics",        "Israel",        "Kissinger",        "PoliticalScience",        "Security" .
        `,
        mirrors: [
          {
            id: 'post-id-1',
            post_id: published.info().uri as string,
            publishOrigin: PlatformPostPublishOrigin.POSTED,
            publishStatus: PlatformPostPublishStatus.PUBLISHED,
            platformId: PLATFORM.Nanopub,
            posted: {
              post_id: published.info().uri as string,
              user_id: 'test-user-id',
              timestampMs: Date.now(),
              post: published.rdf(),
            },
          },
        ],
      },
      PLATFORM.Twitter
    );
    const updatedNanopub = await createNanopublication(updatedPost, mockUser);
    const updatedSigned = await signNanopublication(
      updatedNanopub.rdf(),
      rsaKeys,
      ''
    );

    const updatedPublished: Nanopub = await (async () => {
      if (!PUBLISH) {
        return updatedSigned;
      }
      return await updatedSigned.publish(undefined, nanopubServer);
    })();
    expect(updatedPublished).to.not.be.undefined;
    if (DEBUG)
      logger.debug('update published at: ', {
        published: updatedPublished.info().published,
        rdf: updatedPublished.rdf(),
      });
    if (PUBLISH) {
      const fetchedUpdatedPub = (await Nanopub.fetch(
        updatedPublished.info().published
      )) as Nanopub;
      expect(fetchedUpdatedPub).to.not.be.undefined;
    }
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

    const published: Nanopub = await (async () => {
      if (!PUBLISH) {
        return signed;
      }
      return await signed.publish(undefined, nanopubServer);
    })();

    expect(published).to.not.be.undefined;
    if (DEBUG)
      logger.debug('published at: ', {
        published: published.info().published,
        rdf: published.rdf(),
      });

    if (PUBLISH) {
      const fetchedPub = (await Nanopub.fetch(
        published.info().published
      )) as Nanopub;
      expect(fetchedPub).to.not.be.undefined;
    }

    /** update the intro nanopublication with twitter info */
    const updatedIntroNanopub = await buildIntroNp(
      profile.ethAddress,
      profile.rsaPublickey,
      profile.ethToRsaSignature,
      {
        signDelegation: true,
        supersedesOptions: {
          root: published.info().uri,
          latest: published.info().uri,
        },
        author: {
          platformId: PLATFORM.Twitter,
          id: '1773032135814717440',
          username: 'sense_nets_bot',
          name: 'SenseNet Bot',
        },
      }
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

    const updatedPublished: Nanopub = await (() => {
      if (!PUBLISH) {
        return updatedSigned;
      }
      return updatedSigned.publish(undefined, nanopubServer);
    })();

    expect(updatedPublished).to.not.be.undefined;
    if (DEBUG)
      logger.debug('update published at: ', {
        published: updatedPublished.info().published,
        rdf: updatedPublished.rdf(),
      });
    if (PUBLISH) {
      const updatedFetchedPub = (await Nanopub.fetch(
        updatedPublished.info().published
      )) as Nanopub;
      expect(updatedFetchedPub).to.not.be.undefined;
    }

    /** update the intro nanopublication with orcid id */
    const orcidUpdatedIntroNanopub = await buildIntroNp(
      profile.ethAddress,
      profile.rsaPublickey,
      profile.ethToRsaSignature,
      {
        signDelegation: true,
        supersedesOptions: {
          root: published.info().uri,
          latest: published.info().uri,
        },
        author: {
          platformId: PLATFORM.Twitter,
          id: '1773032135814717440',
          username: 'sense_nets_bot',
          name: 'SenseNet Bot',
        },
        orcidId: '0000-0000-0000-0000',
      }
    );

    if (!orcidUpdatedIntroNanopub) {
      throw new Error('Post not created');
    }

    const orcidUpdatedSigned = await signNanopublication(
      orcidUpdatedIntroNanopub.rdf(),
      rsaKeys,
      ''
    );
    expect(orcidUpdatedSigned).to.not.be.undefined;

    const orcidUpdatedPublished: Nanopub = await (() => {
      if (!PUBLISH) {
        return orcidUpdatedSigned;
      }
      return orcidUpdatedSigned.publish(undefined, nanopubServer);
    })();

    expect(orcidUpdatedPublished).to.not.be.undefined;
    if (DEBUG)
      logger.debug('orcid update published at: ', {
        published: orcidUpdatedPublished.info().published,
        rdf: orcidUpdatedPublished.rdf(),
      });
    if (PUBLISH) {
      const orcidUpdatedFetchedPub = (await Nanopub.fetch(
        orcidUpdatedPublished.info().published
      )) as Nanopub;
      expect(orcidUpdatedFetchedPub).to.not.be.undefined;
    }
  });

  it('publishes a correctly formatted mock app intro nanopub to the test server', async () => {
    const privateKey1 =
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const privateKey2 =
      '0xac0974bec38b27e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    const { profile: profile1, rsaKeys: rsaKeys1 } =
      await getNanopubProfile(privateKey1);
    const { profile: profile2, rsaKeys: rsaKeys2 } =
      await getNanopubProfile(privateKey2);

    const appIntroNp = await buildAppIntroNp(
      `http://${profile1.ethAddress}`,
      cleanPublicKey(rsaKeys1),
      `http://${profile2.ethAddress}`,
      cleanPublicKey(rsaKeys2)
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

    const published: Nanopub = await (async () => {
      if (!PUBLISH) {
        return signed;
      }
      return await signed.publish(undefined, nanopubServer);
    })();

    expect(published).to.not.be.undefined;
    if (DEBUG)
      logger.debug('published at: ', {
        published: published.info().published,
        rdf: published.rdf(),
      });
    if (PUBLISH) {
      const fetchedPub = (await Nanopub.fetch(
        published.info().published
      )) as Nanopub;
      expect(fetchedPub).to.not.be.undefined;
    }

    /** update the intro nanopublication */
    const updatedAppIntroNp = await buildAppIntroNp(
      `http://${profile1.ethAddress}`,
      cleanPublicKey(rsaKeys1),
      `http://${profile2.ethAddress}`,
      cleanPublicKey(rsaKeys2)
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

    const updatedPublished: Nanopub = await (() => {
      if (!PUBLISH) {
        return updatedSigned;
      }
      return updatedSigned.publish(undefined, nanopubServer);
    })();

    expect(updatedPublished).to.not.be.undefined;
    if (DEBUG)
      logger.debug('update published at: ', {
        published: updatedPublished.info().published,
        rdf: updatedPublished.rdf(),
      });
    if (PUBLISH) {
      const updatedFetchedPub = (await Nanopub.fetch(
        updatedPublished.info().published
      )) as Nanopub;
      expect(updatedFetchedPub).to.not.be.undefined;
    }
  });
});
