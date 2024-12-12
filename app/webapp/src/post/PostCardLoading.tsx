import React from 'react';

import { LoadingDiv } from '../ui-components/LoadingDiv';

export const PostCardLoading = () => {
  return (
    <LoadingDiv
      height="410px"
      width="100%"
      style={{ flexShrink: 0 }}
      margin={{ bottom: '2px' }}></LoadingDiv>
  );
};
