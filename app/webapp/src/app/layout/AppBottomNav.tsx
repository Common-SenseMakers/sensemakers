import { Box } from 'grommet';
import { ReactElement, useMemo } from 'react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppButton, IButton } from '../../ui-components';
import { useThemeContext } from '../../ui-components/ThemedApp';

export const AppBottomButton = (props: IButton) => {
  return (
    <Box style={{ width: '100%' }} pad="small" align="center">
      <AppButton {...props} style={{ width: '100%' }}></AppButton>
    </Box>
  );
};

export interface IPath {
  label?: string;
  icon?: ReactElement;
  disabled?: boolean;
  action?: () => void;
  path?: string;
}

export const AppBottomNav = (props: { paths: IPath[] }) => {
  const { constants } = useThemeContext();

  const location = useLocation();
  const navigate = useNavigate();
  const { paths } = props;

  const style: React.CSSProperties = {
    flexGrow: '1',
    maxWidth: '300px',
    width: '50%',
    borderRadius: '0px',
  };

  const clicked = (details: IPath) => {
    if (details.action) {
      details.action();
    } else if (details.path) {
      navigate(details.path);
    } else {
      throw new Error('unexpected');
    }
  };

  return (
    <Box
      fill
      direction="row"
      justify="evenly"
      style={{
        position: 'relative',
        backgroundColor: constants.colors.backgroundLightShade,
        borderTop: `2px solid ${constants.colors.primary}`,
        fontSize: '16px',
        fontWeight: 'bold',
      }}>
      {paths.map((path, ix) => {
        const pathDetails = paths[ix];
        const isPage = location.pathname === path;

        return (
          <AppButton
            plain
            key={ix}
            label={pathDetails.label}
            icon={
              pathDetails.icon ? (
                React.cloneElement(pathDetails.icon, {
                  color: isPage
                    ? constants.colors.textOnPrimary
                    : constants.colors.text,
                })
              ) : (
                <></>
              )
            }
            onClick={() => clicked(pathDetails)}
            style={{
              ...style,
              borderLeft:
                ix === 0 ? 'none' : `2px solid ${constants.colors.primary}`,
            }}
            primary={isPage}
            disabled={pathDetails.disabled}></AppButton>
        );
      })}
    </Box>
  );
};
