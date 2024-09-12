import { Nanopub } from '@nanopub/sign';

import { RSAKeys } from '../src/@shared/types/types.nanopubs';
import { HexStr, PLATFORM } from '../src/@shared/types/types.user';
import { signNanopublication } from '../src/@shared/utils/nanopub.sign.util';
import { cleanPublicKey } from '../src/@shared/utils/semantics.helper';
import {
  buildAppIntroNp
} from '../src/platforms/nanopub/create.app.intro.nanopub';
import { NanopubService } from '../src/platforms/nanopub/nanopub.service';
import { getNanopubProfile } from '../test/utils/nanopub.profile';
import { services } from './scripts.services';
import { buildLinkAccountsNanopub } from '../src/platforms/nanopub/nanopub.utils';


const mandatory = ['PRIVATE_KEY_ROOT', 'PRIVATE_KEY_APPROVED'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .script.env)`
    );
  }
});

const rootPrivateKey = process.env.PRIVATE_KEY_ROOT as HexStr;
const approvedPrivateKey = process.env.PRIVATE_KEY_APPROVED as HexStr;

const signAndPublishNanopub = async (unsigned: Nanopub, rsaKeys: RSAKeys) => {
  const signed = await signNanopublication(unsigned.rdf(), rsaKeys, '');
  const nanopub = services.platforms.get(PLATFORM.Nanopub) as NanopubService;
  const published = await nanopub.publishInternal(signed.rdf());
  return published;
};

const publishLinkedKeysNanopub = async (privateKey: HexStr) => {
  const { profile, rsaKeys } = await getNanopubProfile(privateKey);

  const keysLinking = await buildLinkAccountsNanopub(
    profile.ethAddress,
    profile.rsaPublickey,
    profile.ethToRsaSignature
  );

  const published = await signAndPublishNanopub(keysLinking, rsaKeys);

  if (!published) {
    throw new Error('Failed to publish linked keys nanopub');
  }

  return { published, profile, rsaKeys };
};

(async () => {
  const { published: rootLinkingNanopub, rsaKeys: rootRSAKey } =
    await publishLinkedKeysNanopub(rootPrivateKey);

  const { published: approvedLinkingNanopub, rsaKeys: approvedRsaKeys } =
    await publishLinkedKeysNanopub(approvedPrivateKey);

  const unsignedIntroNanopub = await buildAppIntroNp(
    rootLinkingNanopub.info().uri,
    cleanPublicKey(rootRSAKey),
    approvedLinkingNanopub.info().uri,
    cleanPublicKey(approvedRsaKeys)
  );
  const introNanopub = await signAndPublishNanopub(
    unsignedIntroNanopub,
    rootRSAKey
  );

  console.log('linked keys nanopubs:', {
    approvedLinkingNanopub: approvedLinkingNanopub?.rdf(),
    rootLinkingNanopub: rootLinkingNanopub?.rdf(),
    introNanopub: introNanopub?.rdf(),
    approvedRsaKeys,
  });
})();
