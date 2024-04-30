import { Box, Image, ImageExtendedProps } from 'grommet';

import { useThemeContext } from './ThemedApp';

export interface ICampaignIcon extends ImageExtendedProps {
  iconSize?: string;
}

export const CampaignIcon = (props: ICampaignIcon): JSX.Element => {
  const { constants } = useThemeContext();

  const size = props.iconSize || '120px';
  const reg = new RegExp('(\\d+\\s?)(\\w+)');
  const parts = reg.exec(size);

  if (parts === null) {
    throw new Error(`size wrong`);
  }

  const value = +parts[1];
  const units = parts[2];

  return (
    <Box
      style={{
        height: `${value}${units}`,
        width: `${value}${units}`,
        borderRadius: `${value / 2}${units}`,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: constants.colors.primaryLight,
        ...props.style,
      }}>
      <Image fit="cover" src={props.src || '/images/welcome-bg-1.png'}></Image>
    </Box>
  );
};
