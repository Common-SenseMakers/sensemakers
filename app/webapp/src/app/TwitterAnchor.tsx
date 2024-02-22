import { Anchor, AnchorExtendedProps } from 'grommet';
import { useTranslation } from 'react-i18next';

import { LoadingDiv } from '../ui-components/LoadingDiv';

export const TwitterProfileAnchor = (props: { screen_name?: string }) => {
  if (!props.screen_name) {
    return <LoadingDiv></LoadingDiv>;
  }
  return (
    <Anchor
      style={{}}
      target="_blank"
      href={`https://twitter.com/${props.screen_name}`}
      size="small">
      {props.screen_name}
    </Anchor>
  );
};

export const TweetAnchor = (props: { id?: string; label?: string }) => {
  const { t } = useTranslation();
  const label = props.label ? props.label : t('viewPost');
  if (!props.id) {
    return <LoadingDiv></LoadingDiv>;
  }
  return (
    <Anchor
      style={{}}
      target="_blank"
      href={`https://twitter.com/x/status/${props.id}`}
      size="medium">
      {label}
    </Anchor>
  );
};

export const NanopubAnchor = (props: AnchorExtendedProps) => {
  const { t } = useTranslation();
  return (
    <Anchor target="_blank" size="small" {...props}>
      {t('nanopub')}
    </Anchor>
  );
};
