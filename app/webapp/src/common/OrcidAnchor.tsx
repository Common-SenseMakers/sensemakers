import { Anchor } from 'grommet';

import { LoadingDiv } from '../ui-components/LoadingDiv';

export const OrcidAnchor = (props: { orcid?: string }) => {
  if (!props.orcid) {
    return <LoadingDiv></LoadingDiv>;
  }
  return (
    <Anchor
      style={{}}
      target="_blank"
      href={`https://orcid.org/${props.orcid}`}
      size="small">
      {props.orcid}
    </Anchor>
  );
};
