import { Box } from 'grommet';
import { DataFactory } from 'n3';
import { useMemo } from 'react';

import {
  filterStore,
  mapStoreElements,
  writeRDF,
} from '../../../shared/utils/n3.utils';
import { THIS_POST_NAME } from '../../../shared/utils/semantics.helper';
import { AppLabelsEditor } from '../../../ui-components/AppLabelsEditor';
import { LoadingDiv } from '../../../ui-components/LoadingDiv';
import { useSemanticsStore } from '../common/use.semantics';
import { PatternProps } from '../patterns';

export const KeywordsComponent = (props: PatternProps) => {
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

  if (props.isLoading) {
    return (
      <Box direction="row" gap="10px" pad={{ vertical: '8px' }}>
        {[0, 1, 2].map((n) => (
          <LoadingDiv
            key={n}
            height={'24px'}
            style={{ borderRadius: '8px', width: '120px' }}></LoadingDiv>
        ))}
      </Box>
    );
  }

  return (
    <Box direction="row">
      <Box
        style={{
          flexGrow: 1,
        }}
        direction="row">
        <AppLabelsEditor
          maxLabels={props.size === 'compact' ? 2 : undefined}
          editable={props.editable}
          colors={{ font: '#498283', background: '#F5FCFC', border: '#BDD9D7' }}
          labels={keywords}
          addLabel={(newLabel) => addKeyword(newLabel)}
          removeLabel={(newLabel) => removeKeyword(newLabel)}></AppLabelsEditor>
      </Box>
    </Box>
  );
};
