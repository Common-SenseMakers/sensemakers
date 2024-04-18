import { Box, Image } from 'grommet';

import { AppCard, AppHeading, FixedHeightPar } from '../../../ui-components';

export const RefCard = (props: {
  title?: string;
  description?: string;
  image?: string;
}) => {
  return (
    <AppCard
      direction="row"
      align="start"
      style={{ padding: '18px 12px' }}
      gap="medium">
      <Box width="30%" style={{ flexShrink: 0 }}>
        {props.image ? <Image src={props.image}></Image> : <></>}
      </Box>
      <Box>
        <AppHeading level="4">{props.title}</AppHeading>
        <FixedHeightPar _content={<>{props.description}</>}></FixedHeightPar>
      </Box>
    </AppCard>
  );
};
