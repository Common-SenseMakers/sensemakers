import {
  Accordion,
  AccordionExtendedProps,
  AccordionPanel,
  AccordionPanelExtendedProps,
  Box,
} from 'grommet';
import React, { CSSProperties, ReactElement, useState } from 'react';

import { HorizontalLine } from './HorizontalLine';
import { useThemeContext } from './ThemedApp';

/** forward an active property to know if panel is expanded (active is Context in grommet and we don't have
 * access to it here.) */
export const AppAccordion = (props: AccordionExtendedProps): JSX.Element => {
  const [activeIx, setActiveIx] = useState<number>();

  if (props.children === null || props.children === undefined) {
    return <></>;
  }

  const children = props.children as ReactElement[];

  return (
    <Accordion
      {...props}
      onActive={(_ix): void => {
        if (_ix && _ix.length > 0) {
          setActiveIx(_ix[0]);
        } else {
          setActiveIx(undefined);
        }
      }}>
      {children.map((child, ix) => {
        return React.cloneElement(child, {
          active: activeIx !== undefined && activeIx === ix,
        });
      })}
    </Accordion>
  );
};

export interface IAppAccordionPanel extends AccordionPanelExtendedProps {
  active?: boolean;
  subtitle: string;
}

export const AppAccordionPanel = (props: IAppAccordionPanel): JSX.Element => {
  const { constants } = useThemeContext();

  const headingBasicStyle: CSSProperties = {
    color: constants.colors.headings,
    padding: '12px 6px',
  };

  const headingStyle: CSSProperties = props.active
    ? {
        ...headingBasicStyle,

        borderTop: '1px solid',
        borderLeft: '1px solid',
        borderRight: '1px solid',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }
    : {
        ...headingBasicStyle,

        border: '1px solid',
        borderRadius: '8px',
      };

  const dropBasicStyle: CSSProperties = {
    color: constants.colors.headings,
    padding: '0px 12px 12px 12px', // Accordion panel has a hardcoded padding of 6px on the title
  };

  const dropStyle: CSSProperties = props.active
    ? {
        ...dropBasicStyle,
        borderBottom: '1px solid',
        borderLeft: '1px solid',
        borderRight: '1px solid',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
      }
    : {
        ...headingBasicStyle,
        border: '1px solid',
        borderRadius: '8px',
      };

  return (
    <AccordionPanel
      {...props}
      style={{
        ...headingStyle,
        ...props.style,
      }}>
      <Box
        style={{
          ...dropStyle,
        }}>
        <Box
          style={{
            fontSize: constants.textFontSizes.small,
            fontWeight: '500',
            color: constants.colors.text,
          }}>
          {props.subtitle}
        </Box>
        <HorizontalLine style={{ margin: '16px 0px' }}></HorizontalLine>
        {props.children}
      </Box>
    </AccordionPanel>
  );
};
