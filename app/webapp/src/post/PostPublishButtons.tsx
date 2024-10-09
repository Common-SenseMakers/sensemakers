import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { ClearIcon } from '../app/icons/ClearIcon';
import { SendIcon } from '../app/icons/SendIcon';
import { I18Keys } from '../i18n/i18n';
import { AppButton } from '../ui-components';
import { usePost } from './post.context/PostContext';

export const PublishButtons = (props: { compact?: boolean }) => {
  const { t } = useTranslation();

  const compact = props.compact !== undefined ? props.compact : false;
  const { publish, updated } = usePost();

  if (compact) {
    return (
      <Box
        direction="row"
        justify="end"
        gap="16px"
        align="center"
        pad={{ bottom: '12px' }}>
        <AppButton
          plain
          icon={<ClearIcon color="#1F2937" size={20}></ClearIcon>}
          onClick={() => publish.ignorePost()}></AppButton>
        <AppButton
          plain
          disabled={!updated.readyToNanopublish}
          icon={<SendIcon color="#1F2937" size={20}></SendIcon>}
          onClick={() => publish.setPublishIntent(true)}></AppButton>
      </Box>
    );
  } else {
    return (
      <Box direction="row" gap="small" margin={{ top: 'medium' }}>
        <Box width="50%" style={{ flexGrow: 1 }}>
          <AppButton
            icon={<ClearIcon></ClearIcon>}
            onClick={() => publish.ignorePost()}
            label={t(I18Keys.ignore)}></AppButton>
        </Box>
        <Box width="50%" align="end" gap="small">
          <AppButton
            primary
            disabled={!updated.readyToNanopublish}
            icon={<SendIcon></SendIcon>}
            onClick={() => publish.setPublishIntent(true)}
            label={t(I18Keys.publish)}
            style={{ width: '100%' }}></AppButton>
        </Box>
      </Box>
    );
  }
};
