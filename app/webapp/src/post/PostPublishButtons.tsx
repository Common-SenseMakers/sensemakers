import { Box, BoxExtendedProps } from 'grommet';
import { DataFactory } from 'n3';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { PostEditKeys } from '../i18n/i18n.edit.post';
import { AppPostParsingStatus } from '../shared/types/types.posts';
import {
  cloneStore,
  getNode,
  tripleToQuad,
  writeRDF,
} from '../shared/utils/n3.utils';
import {
  HAS_TOPIC_URI,
  NOT_SCIENCE_TOPIC_URI,
  SCIENCE_TOPIC_URI,
  THIS_POST_NAME_URI,
} from '../shared/utils/semantics.helper';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { usePost } from './post.context/PostContext';

const DEBUG = false;

export const PublishButtons = (props: BoxExtendedProps) => {
  const { t } = useTranslation();
  const { updated, fetched } = usePost();
  const { connectedUser } = useAccountContext();

  const isScience = useMemo(() => {
    if (!updated.storeMerged) {
      return false;
    }
    const [subject, predicate, object] = [
      THIS_POST_NAME_URI,
      HAS_TOPIC_URI,
      SCIENCE_TOPIC_URI,
    ];

    const _isScience = updated.storeMerged.has(
      DataFactory.quad(
        DataFactory.namedNode(subject),
        DataFactory.namedNode(predicate),
        getNode(object),
        DataFactory.defaultGraph()
      )
    );

    if (DEBUG) console.log('PublishButtons - isScience', _isScience);

    if (_isScience) return true;
    return false;
  }, [updated.storeMerged]);

  const checkboxChanged = useCallback(
    async (value: boolean) => {
      if (!updated.storeMerged) {
        throw new Error('Unexpected');
      }

      const newStore = cloneStore(updated.storeMerged);
      if (value) {
        newStore.removeQuad(
          tripleToQuad([
            THIS_POST_NAME_URI,
            HAS_TOPIC_URI,
            NOT_SCIENCE_TOPIC_URI,
          ])
        );
        newStore.addQuad(
          tripleToQuad([THIS_POST_NAME_URI, HAS_TOPIC_URI, SCIENCE_TOPIC_URI])
        );
      } else {
        newStore.removeQuad(
          tripleToQuad([THIS_POST_NAME_URI, HAS_TOPIC_URI, SCIENCE_TOPIC_URI])
        );
        newStore.addQuad(
          tripleToQuad([
            THIS_POST_NAME_URI,
            HAS_TOPIC_URI,
            NOT_SCIENCE_TOPIC_URI,
          ])
        );
      }

      const newSemantics = await writeRDF(newStore);
      if (!newSemantics) throw new Error('Unexpected');
      updated
        .updateSemantics(newSemantics)
        .then(() => {
          /** force refetch instead of waiting for real time update */
          fetched.refetch();
        })
        .catch(console.error);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updated.storeMerged]
  );

  const show =
    connectedUser &&
    updated.postMerged &&
    updated.postMerged.authorUserId === connectedUser.userId;

  if (!show) {
    return <></>;
  }

  return (
    <Box
      direction="row"
      justify="between"
      gap="16px"
      align="center"
      pad={{ vertical: '12px', horizontal: '12px' }}
      {...props}
      style={{ backgroundColor: '#FFEEDB', width: '100%', ...props.style }}>
      {updated.postMerged?.parsingStatus === AppPostParsingStatus.PROCESSING ? (
        <LoadingDiv style={{ width: '160px' }}></LoadingDiv>
      ) : (
        <AppCheckBoxMessage
          reverse
          boxType="toggle"
          message={t(PostEditKeys.publish)}
          checked={isScience}
          onCheckChange={(value) => {
            checkboxChanged(value).catch((e) => console.error(e));
          }}></AppCheckBoxMessage>
      )}
    </Box>
  );
};
