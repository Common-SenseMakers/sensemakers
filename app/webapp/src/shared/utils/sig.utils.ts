export const DETERMINISTIC_MESSAGE = 'Prepare my Nanopub identity';

export const getRsaToEthMessage = (address: string) => {
  return `This RSA pair is controlled by ETH address: ${address}`;
};

export const getEthToRSAMessage = (publicKey: string) => {
  return `This account controls the RSA public key: ${publicKey}`;
};
