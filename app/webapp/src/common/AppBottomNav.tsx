import { Box } from 'grommet';
import { FormNext, FormPrevious } from 'grommet-icons';
import { ReactElement, useMemo } from 'react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AppButton, AppCard, IButton } from '../ui-components';
import { useThemeContext } from '../ui-components/ThemedApp';

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
}

export const AppBottomNav = (props: {
  paths: Record<string, IPath>;
  popUp?: string;
}) => {
  const { constants } = useThemeContext();

  const location = useLocation();
  const navigate = useNavigate();
  const paths = useMemo(
    () => Array.from(Object.keys(props.paths)),
    [props.paths]
  );

  const style: React.CSSProperties = {
    flexGrow: '1',
    maxWidth: '300px',
    width: '50%',
    borderRadius: '0px',
  };

  const clicked = (path: string) => {
    const pathDetais = props.paths[path];
    if (pathDetais.action) {
      pathDetais.action();
    } else {
      navigate(path);
    }
  };

  return (
    <Box direction="row" justify="evenly" style={{ position: 'relative' }}>
      {paths.map((path) => {
        const pathDetais = props.paths[path];
        const isPage = location.pathname === path;

        return (
          <AppButton
            label={pathDetais.label}
            icon={
              pathDetais.icon ? (
                React.cloneElement(pathDetais.icon, {
                  color: isPage
                    ? constants.colors.textOnPrimary
                    : constants.colors.text,
                })
              ) : (
                <></>
              )
            }
            onClick={() => clicked(path)}
            style={style}
            primary={isPage}
            disabled={pathDetais.disabled}></AppButton>
        );
      })}
    </Box>
  );
};
