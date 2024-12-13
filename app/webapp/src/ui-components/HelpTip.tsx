import { Box, BoxExtendedProps, DropButton } from 'grommet';
import { CircleQuestion } from 'grommet-icons';
import { ReactNode } from 'react';

import { parseCssUnits } from './utils';

export const HelpDrop = (props: BoxExtendedProps) => {
  return (
    <Box style={{ padding: '16px 16px', fontSize: '12px' }}>
      {props.children}
    </Box>
  );
};

interface IHelpTip extends BoxExtendedProps {
  _content: ReactNode;
  icon?: JSX.Element;
  iconSize?: string;
}

export const HelpTip = (props: IHelpTip) => {
  const { _content, icon } = props;

  const size = props.iconSize || '13.33px';
  const [value, units] = parseCssUnits(size);

  return (
    <>
      <DropButton
        style={{ ...props.style }}
        dropContent={<HelpDrop>{_content}</HelpDrop>}
        dropProps={{
          margin: '10px',
          align: { top: 'bottom', right: 'right' },
          style: { borderRadius: '4px', maxWidth: '280px' },
        }}>
        <Box justify="center" style={{ overflow: 'hidden' }}>
          {!icon && (
            <CircleQuestion
              style={{
                height: `${value}${units}`,
                width: `${value}${units}`,
              }}></CircleQuestion>
          )}
          {icon}
        </Box>
      </DropButton>
    </>
  );
};
