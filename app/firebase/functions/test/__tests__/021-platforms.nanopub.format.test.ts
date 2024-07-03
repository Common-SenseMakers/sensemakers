import { Nanopub } from '@nanopub/sign';
import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.user';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { NanopubService } from '../../src/platforms/nanopub/nanopub.service';
import { TimeService } from '../../src/time/time.service';
import { getMockPost } from '../utils/posts.utils';
import { getMockedUser } from '../utils/users.mock';

it('publishes a correctly formatted mock nanopub to the test server', async () => {
  try {
    const post = getMockPost({ authorId: 'test-user-id', id: 'post-id-1' });
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
    console.log('published: ', published.info(), published.rdf());
    const fetchedPub = (await Nanopub.fetch(
      published.info().published
    )) as Nanopub;
    expect(fetchedPub).to.not.be.undefined;
  } catch (error) {
    console.error('error: ', error);
    throw error;
  }
});
