import { HexStr, PLATFORM } from '../src/@shared/types/types.user';
import { signNanopublication } from '../src/@shared/utils/nanopub.sign.util';
import { cleanPublicKey } from '../src/@shared/utils/semantics.helper';
import {
  buildAppIntroNp,
  buildLinkAccountsNanopub,
} from '../src/platforms/nanopub/create.app.intro.nanopub';
import { NanopubService } from '../src/platforms/nanopub/nanopub.service';
import { getNanopubProfile } from '../test/utils/nanopub.profile';
import { services } from './scripts.services';

const mandatory = ['PRIVATE_KEY_1', 'PRIVATE_KEY_2'];

mandatory.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(
      `${varName} undefined in process.env (derived from .script.env)`
    );
  }
});

const rootPrivateKey = process.env.PRIVATE_KEY_1 as HexStr;
const approvedPrivateKey = process.env.PRIVATE_KEY_2 as HexStr;

const publishLinkedKeysNanopub = async (privateKey: HexStr) => {
  const { profile: approvedProfile, rsaKeys: approvedRsaKeys } =
    await getNanopubProfile(privateKey);

  const approvedKeysLinking = await buildLinkAccountsNanopub(
    approvedProfile.ethAddress,
    approvedProfile.rsaPublickey,
    approvedProfile.ethToRsaSignature
  );

  const signed = await signNanopublication(
    approvedKeysLinking.rdf(),
    approvedRsaKeys,
    ''
  );
  const nanopub = services.platforms.get(PLATFORM.Nanopub) as NanopubService;
  const published = await nanopub.publishInternal(signed.rdf());

  return { published, approvedProfile, approvedRsaKeys };
};

(async () => {
  const { published: rootLinkingNanopub } =
    await publishLinkedKeysNanopub(rootPrivateKey);

  const { published: approvedLinkingNanopub } =
    await publishLinkedKeysNanopub(approvedPrivateKey);

  // const appIntroNp = await buildAppIntroNp(
  //   rootLinkingNanopub?.rdf().uri,
  //   approvedLinkingNanopub?.rdf().uri
  // );

  console.log('approvedLinkingNanopubs', {
    approvedLinkingNanopub: approvedLinkingNanopub?.rdf(),
  });
})();
