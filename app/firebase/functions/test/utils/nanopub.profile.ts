import { privateKeyToAccount } from 'viem/accounts';

import { HexStr } from '../../src/@shared/types/types';
import { NanupubSignupData } from '../../src/@shared/types/types.nanopubs';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import {
  DETERMINISTIC_MESSAGE,
  getEthToRSAMessage,
} from '../../src/@shared/utils/sig.utils';

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
    ethToRsaSignature,
  };

  return { profile, rsaKeys };
};
