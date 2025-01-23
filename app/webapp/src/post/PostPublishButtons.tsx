import { Box, BoxExtendedProps, Text } from 'grommet';
import { DataFactory } from 'n3';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { InfoIcon } from '../app/icons/InfoIcon';
import { PostEditKeys } from '../i18n/i18n.edit.post';
import { SciFilterClassfication } from '../shared/types/types.parser';
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
import { HelpTip } from '../ui-components';
import { DeleteButton } from '../ui-components/DeleteButton';
import { LoadingDiv } from '../ui-components/LoadingDiv';
import { useThemeContext } from '../ui-components/ThemedApp';
import { useAccountContext } from '../user-login/contexts/AccountContext';
import { usePost } from './post.context/PostContext';

const DEBUG = false;

export const PublishButtons = (
  props: BoxExtendedProps & { handlePostDelete: () => void }
) => {
  const { constants } = useThemeContext();
  const { t } = useTranslation();
  const { updated, fetched } = usePost();
  const { connectedUser } = useAccountContext();

  const isAIDetected =
    updated.postMerged?.originalParsed &&
    [
      SciFilterClassfication.AI_DETECTED_RESEARCH,
      SciFilterClassfication.CITOID_DETECTED_RESEARCH,
    ].includes(updated.postMerged.originalParsed.filter_classification);

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

  const backgroundColor = isScience ? '#CEE2F2' : constants.colors.shade;

  if (!show) {
    return <></>;
  }

  return (
    <Box
      direction="row"
      justify="between"
      align="center"
      pad={{ vertical: '12px', horizontal: '12px' }}
      {...props}
      style={{ backgroundColor, width: '100%', flexShrink: 0, ...props.style }}>
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

      {updated.postMerged?.parsingStatus === AppPostParsingStatus.PROCESSING ? (
        <LoadingDiv style={{ width: '160px' }}></LoadingDiv>
      ) : (
        <Box direction="row" gap="6px" align="center">
          <Text
            style={{
              color: '#374151',
              textAlign: 'center',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '14px',
            }}>
            {isAIDetected
              ? t(PostEditKeys.researchDetected)
              : t(PostEditKeys.researchNotDetected)}
          </Text>
          <HelpTip
            icon={<InfoIcon size={16}></InfoIcon>}
            _content={
              <Text
                style={{
                  color: '#374151',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '16px',
                }}>
                {isAIDetected
                  ? t(PostEditKeys.researchDetectedHelp)
                  : t(PostEditKeys.reseachNotDetectedHelp)}
              </Text>
            }></HelpTip>
          <DeleteButton onClick={props.handlePostDelete}></DeleteButton>
        </Box>
      )}
    </Box>
  );
};
