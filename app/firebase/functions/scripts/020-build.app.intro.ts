import { HexStr, PLATFORM } from '../src/@shared/types/types.user';
import { signNanopublication } from '../src/@shared/utils/nanopub.sign.util';
import { cleanPublicKey } from '../src/@shared/utils/semantics.helper';
import { buildAppIntroNp } from '../src/platforms/nanopub/create.app.intro.nanopub';
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

const privateKey1 = process.env.PRIVATE_KEY_1 as HexStr;
const privateKey2 = process.env.PRIVATE_KEY_2 as HexStr;

(async () => {
  const { profile: profile1, rsaKeys: rsaKeys1 } =
    await getNanopubProfile(privateKey1);
  const { profile: profile2, rsaKeys: rsaKeys2 } =
    await getNanopubProfile(privateKey2);

  const appIntroNp = await buildAppIntroNp(
    profile1.ethAddress,
    profile2.ethAddress,
    cleanPublicKey(rsaKeys1),
    cleanPublicKey(rsaKeys2),
    profile1.ethToRsaSignature,
    profile2.ethToRsaSignature
  );

  const signed = await signNanopublication(appIntroNp.rdf(), rsaKeys1, '');
  const nanopub = services.platforms.get(PLATFORM.Nanopub) as NanopubService;

  const published = await nanopub.publishInternal(signed.rdf());

  console.log('published', { published: published?.rdf() });
})();
