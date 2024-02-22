import { Box } from 'grommet';
import { DataFactory } from 'n3';
import { useMemo } from 'react';

import { THIS_POST_NAME } from '../../../app/config';
import {
  filterStore,
  mapStoreElements,
  writeRDF,
} from '../../../shared/n3.utils';
import { AppLabelsEditor } from '../../../ui-components/AppLabelsEditor';
import { useThemeContext } from '../../../ui-components/ThemedApp';
import { useSemanticsStore } from '../common/use.semantics';
import { PatternProps } from '../patterns';

export const KeywordsComponent = (props: PatternProps) => {
  const { constants } = useThemeContext();

  /** actual semantics */
  const { store } = useSemanticsStore(props);

  const KEYWORD_PREDICATE =
    props.originalParsed?.support?.ontology?.keyword_predicate?.uri;

  const keywords = useMemo<string[]>(() => {
    if (!store || !KEYWORD_PREDICATE) return [];
    return mapStoreElements<string>(
      store,
      (quad) => quad.object.value,
      null,
      DataFactory.namedNode(KEYWORD_PREDICATE)
    );
  }, [KEYWORD_PREDICATE, store]);

  const addKeyword = async (keyword: string) => {
    if (props.semanticsUpdated && store && KEYWORD_PREDICATE) {
      const THIS_POST = DataFactory.namedNode(THIS_POST_NAME);
      const labelNode = DataFactory.namedNode(KEYWORD_PREDICATE);
      const refNode = DataFactory.literal(keyword);

      store.addQuad(
        DataFactory.quad(
          THIS_POST,
          labelNode,
          refNode,
          DataFactory.defaultGraph()
        )
      );

      const newSemantics = await writeRDF(store);
      if (!newSemantics) throw new Error('Unexpected');
      props.semanticsUpdated(newSemantics);
    }
  };

  const removeKeyword = async (keyword: string) => {
    if (props.semanticsUpdated && store && KEYWORD_PREDICATE) {
      const newStore = filterStore(store, (quad) => {
        if (
          quad.object.termType === 'Literal' &&
          quad.object.value === keyword
        ) {
          return false;
        } else {
          return true;
        }
      });
      const newSemantics = await writeRDF(newStore);
      if (!newSemantics) throw new Error('Unexpected');
      props.semanticsUpdated(newSemantics);
    }
  };

  return (
    <Box
      direction="row"
      style={{
        borderLeft: '4px solid',
        borderColor: constants.colors.backgroundLightDarker,
      }}
      pad={{ left: 'medium' }}>
      <Box
        style={{
          flexGrow: 1,
        }}
        direction="row">
        <AppLabelsEditor
          hashtag
          labels={keywords}
          addLabel={(newLabel) => addKeyword(newLabel)}
          removeLabel={(newLabel) => removeKeyword(newLabel)}></AppLabelsEditor>
      </Box>
    </Box>
  );
};
