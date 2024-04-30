import { Box, BoxExtendedProps, DropButton } from 'grommet';
import { CircleQuestion } from 'grommet-icons';
import { ReactNode } from 'react';

import { parseCssUnits } from './utils';

export const HelpDrop = (props: BoxExtendedProps) => {
  return (
    <Box style={{ padding: '21px 16px', fontSize: '12px' }}>
      {props.children}
    </Box>
  );
};

interface IHelpTip extends BoxExtendedProps {
  _content: ReactNode;
  iconSize?: string;
}

export const HelpTip = (props: IHelpTip) => {
  const { content } = props;

  const size = props.iconSize || '13.33px';
  const [value, units] = parseCssUnits(size);

  return (
    <>
      <DropButton
        style={{ ...props.style }}
        dropContent={<HelpDrop>{content}</HelpDrop>}
        dropProps={
          {
            margin: '10px',
            align: { bottom: 'top' },
            style: { borderRadius: '20px', maxWidth: '280px' },
          } as any
        }>
        <Box justify="center" style={{ overflow: 'hidden' }}>
          <CircleQuestion
            style={{
              height: `${value}${units}`,
              width: `${value}${units}`,
            }}></CircleQuestion>
        </Box>
      </DropButton>
    </>
  );
};
