import { Box } from 'grommet';
import { useTranslation } from 'react-i18next';

import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { PostEditKeys } from '../i18n/i18n.edit.post';
import {
  HAS_TOPIC_URI,
  SCIENCE_TOPIC_URI,
  THIS_POST_NAME_URI,
} from '../shared/utils/semantics.helper';
import { usePost } from './post.context/PostContext';

export const PublishButtons = () => {
  const { t } = useTranslation();
  const { updated } = usePost();

  const checkboxChanged = (value: boolean) => {
    if (value) {
      updated.addTriple([THIS_POST_NAME_URI, HAS_TOPIC_URI, SCIENCE_TOPIC_URI]);
    } else {
      updated.removeTriple([
        THIS_POST_NAME_URI,
        HAS_TOPIC_URI,
        SCIENCE_TOPIC_URI,
      ]);
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
        onCheckChange={(value) => checkboxChanged(value)}></AppCheckBoxMessage>
    </Box>
  );
};
