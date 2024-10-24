import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { PostEditKeys } from '../i18n/i18n.edit.post';
import { usePost } from './post.context/PostContext';

export const PublishButtons = () => {
  const { t } = useTranslation();
  const { publish } = usePost();

  const checkboxChanged = (value: boolean) => {
    if (value) {
      publish.publish().catch((e) => {
        console.error('publish error', e);
      });
    } else {
      publish.unpublish();
    }
  };

  return (
    <Box
      direction="row"
      justify="end"
      gap="16px"
      align="center"
      pad={{ bottom: '12px' }}>
      <AppCheckBoxMessage
        message={t(PostEditKeys.publish)}
        onCheckChange={checkboxChanged}></AppCheckBoxMessage>
    </Box>
  );
};
