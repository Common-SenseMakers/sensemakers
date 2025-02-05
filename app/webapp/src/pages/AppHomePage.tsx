import { useMemo } from 'react';

import { ViewportPage } from '../app/layout/Viewport';
import { Welcome } from './Welcome';

const DEBUG = false;

export const AppHomePage = () => {
  const { content, nav, fixed } = useMemo(() => {
    if (DEBUG) console.log('AppHome', {});

    return {
      fixed: false,
      content: <Welcome></Welcome>,
      nav: undefined,
    };
  }, []);

  return (
    <ViewportPage
      addLogo
      fixed={fixed}
      content={content}
      nav={nav}
      justify="start"
    />
  );
};
