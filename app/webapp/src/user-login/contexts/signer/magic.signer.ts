import { OAuthExtension } from '@magic-ext/oauth2';
import { Magic } from 'magic-sdk';
import { createWalletClient, custom } from 'viem';

import { MAGIC_API_KEY } from '../../../app/config';
import { chain } from './ConnectedWalletContext';

const extensions = [new OAuthExtension()];
export const magic = new Magic(MAGIC_API_KEY, {
  extensions,
});

console.log('magic', { magic, extensions });

export const createMagicSigner = async (openUI: boolean) => {
  if (openUI) {
    await magic.wallet.connectWithUI();
  }

  const provider = await magic.wallet.getProvider();

  const client = createWalletClient({
    transport: custom(provider),
    chain: chain,
  });

  return client;
};
