import { Box } from 'grommet';
import { DataFactory } from 'n3';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppCheckBoxMessage } from '../app/icons/AppCheckBoxMessage';
import { PostEditKeys } from '../i18n/i18n.edit.post';
import { useSemanticsStore } from '../semantics/patterns/common/use.semantics';
import { getNode, tripleToQuad, writeRDF } from '../shared/utils/n3.utils';
import {
  HAS_TOPIC_URI,
  NOT_SCIENCE_TOPIC_URI,
  SCIENCE_TOPIC_URI,
  THIS_POST_NAME_URI,
} from '../shared/utils/semantics.helper';
import { usePost } from './post.context/PostContext';

export const PublishButtons = () => {
  const { t } = useTranslation();
  const { updated } = usePost();
  const { store } = useSemanticsStore(
    updated.postMerged?.semantics,
    updated.postMerged?.originalParsed
  );

  const isScience = useMemo(() => {
    const [subject, predicate, object] = [
      THIS_POST_NAME_URI,
      HAS_TOPIC_URI,
      SCIENCE_TOPIC_URI,
    ];

    const _isScience = store.has(
      DataFactory.quad(
        DataFactory.namedNode(subject),
        DataFactory.namedNode(predicate),
        getNode(object),
        DataFactory.defaultGraph()
      )
    );

    if (_isScience) return true;
    return false;
  }, [store]);

  const checkboxChanged = useCallback(
    async (value: boolean) => {
      if (value) {
        store.removeQuad(
          tripleToQuad([
            THIS_POST_NAME_URI,
            HAS_TOPIC_URI,
            NOT_SCIENCE_TOPIC_URI,
          ])
        );
        store.addQuad(
          tripleToQuad([THIS_POST_NAME_URI, HAS_TOPIC_URI, SCIENCE_TOPIC_URI])
        );
      } else {
        store.removeQuad(
          tripleToQuad([THIS_POST_NAME_URI, HAS_TOPIC_URI, SCIENCE_TOPIC_URI])
        );
        store.addQuad(
          tripleToQuad([
            THIS_POST_NAME_URI,
            HAS_TOPIC_URI,
            NOT_SCIENCE_TOPIC_URI,
          ])
        );
      }

      const newSemantics = await writeRDF(store);
      if (!newSemantics) throw new Error('Unexpected');
      updated.updateSemantics(newSemantics);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store]
  );

  return (
    <Box
      style={{ backgroundColor: '#FFEEDB', width: '100%' }}
      direction="row"
      justify="between"
      gap="16px"
      align="center"
      pad={{ vertical: '12px', horizontal: '12px' }}>
      <AppCheckBoxMessage
        message={t(PostEditKeys.publish)}
        checked={isScience}
        onCheckChange={(value) => {
          checkboxChanged(value).catch((e) => console.error(e));
        }}></AppCheckBoxMessage>
    </Box>
  );
};
