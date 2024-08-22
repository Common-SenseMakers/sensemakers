import { Nanopub } from '@nanopub/sign';
import dotenv from 'dotenv';

import { HexStr } from '../src/@shared/types/types.user';
import { signNanopublication } from '../src/@shared/utils/nanopub.sign.util';
import { cleanPublicKey } from '../src/@shared/utils/semantics.helper';
import { buildAppIntroNp } from '../src/platforms/nanopub/create.app.intro.nanopub';
import { getNanopubProfile } from '../test/utils/nanopub.profile';

dotenv.config({ path: './scripts/.script.env' });

const mandatory = [
  'DELEGATION_ETH_PRIVATE_KEY',
  'APP_INTRO_ETH_PRIVATE_KEY',
  'NANOPUBS_PUBLISH_SERVERS',
];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .env.test)`
    );
  }
});

const ethPrivateKey = process.env.DELEGATION_ETH_PRIVATE_KEY as HexStr;
const appIntroEthPrivateKey = process.env.APP_INTRO_ETH_PRIVATE_KEY as HexStr;
const nanopubServers = JSON.parse(
  process.env.NANOPUBS_PUBLISH_SERVERS as string
) as string[];
(async () => {
  const npDelegationProfile = await getNanopubProfile(ethPrivateKey);
  const npAppIntroProfile = await getNanopubProfile(appIntroEthPrivateKey);

  const appIntroNp = await buildAppIntroNp(
    npDelegationProfile.profile.ethAddress,
    npAppIntroProfile.profile.ethAddress,
    cleanPublicKey(npDelegationProfile.rsaKeys),
    cleanPublicKey(npAppIntroProfile.rsaKeys),
    npDelegationProfile.profile.ethToRsaSignature,
    npAppIntroProfile.profile.ethToRsaSignature
  );

  if (!appIntroNp) {
    throw new Error('Nanopub not constructed');
  }

  const signed = await signNanopublication(
    appIntroNp.rdf(),
    npAppIntroProfile.rsaKeys,
    ''
  );
  const nanopubServer = nanopubServers[0];
  if (!nanopubServer) {
    throw new Error('Nanopub server not defined');
  }

  const published: Nanopub = await signed.publish(undefined, nanopubServer);

  console.log('published at: ', {
    published: published.info().published,
    rdf: published.rdf(),
  });
})();
