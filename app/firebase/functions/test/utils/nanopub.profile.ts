import { privateKeyToAccount } from 'viem/accounts';

import { NanupubSignupData } from '../../src/@shared/types/types.nanopubs';
import { HexStr } from '../../src/@shared/types/types.user';
import {
  DETERMINISTIC_MESSAGE,
  getEthToRSAMessage,
} from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';

export const getNanopubProfile = async (privateKey: HexStr) => {
  const ethAccount = privateKeyToAccount(privateKey);

  /** derive RSA keys */
  const seed = await ethAccount.signMessage({
    message: DETERMINISTIC_MESSAGE,
  });
  const rsaKeys = getRSAKeys(seed);

  /** confirm ownership */
  const message = getEthToRSAMessage(rsaKeys.publicKey);
  const ethToRsaSignature = await ethAccount.signMessage({ message });

  const profile: NanupubSignupData = {
    rsaPublickey: rsaKeys.publicKey,
    ethAddress: ethAccount.address,
    introNanopubUri:
      'https://w3id.org/np/RAffsv5cH41cAXA_HOasEJ74XyQXOENnB9lc-iyUCoM4w',
    ethToRsaSignature,
  };

  return { profile, rsaKeys };
};
