import { Anchor, Text } from 'grommet';
import { getAddress } from 'viem';
import { useEnsName } from 'wagmi';

import { HexStr } from '../shared/types';
import { LoadingDiv } from '../ui-components/LoadingDiv';

export const AppAddress = (props: {
  address?: HexStr;
  digits?: number;
  asText?: boolean;
}) => {
  const digits = props.digits || 4;

  const { data: ens } = useEnsName({ address: props.address });

  if (!props.address) {
    return <LoadingDiv></LoadingDiv>;
  }

  const address = getAddress(props.address);

  const addressTxt = address
    ? `0x${address.slice(2, 2 + digits)}...${address.slice(address.length - digits, address.length)}`
    : '';

  if (props.asText) {
    return <Text>{ens ? ens : addressTxt}</Text>;
  }
  return (
    <Anchor
      style={{}}
      target="_blank"
      href={`https://etherscan.io/address/${props.address}`}
      size="medium">
      {ens ? ens : addressTxt}
    </Anchor>
  );
};
