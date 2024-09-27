import { Box } from 'grommet';
import { DataFactory } from 'n3';
import { useMemo } from 'react';

import { RefMeta } from '../../../shared/types/types.parser';
import { filterStore, writeRDF } from '../../../shared/utils/n3.utils';
import { THIS_POST_NAME } from '../../../shared/utils/semantics.helper';
import { AppLabel } from '../../../ui-components';
import { LoadingDiv } from '../../../ui-components/LoadingDiv';
import { splitArray } from '../../../ui-components/utils';
import { useSemanticsStore } from '../common/use.semantics';
import { PatternProps } from '../patterns';
import { RefWithLabels } from './RefLabel';
import { RefData, RefsMap, processSemantics } from './process.semantics';

export const RefLabelsComponent = (props: PatternProps) => {
  const { store, originalStore } = useSemanticsStore(props);
  const size = props.size || 'normal  ';

  /** processed ref labels with metadata */
  const refs = useMemo<RefsMap>(
    () =>
      originalStore && store && props.originalParsed
        ? processSemantics(originalStore, store, props.originalParsed?.support)
        : new Map(),
    [originalStore, props.originalParsed, store]
  );

  const removeLabel = async (ref: string, labelUri: string) => {
    if (props.semanticsUpdated && store) {
      const newStore = filterStore(store, (quad) => {
        if (
          quad.predicate.termType === 'NamedNode' &&
          quad.predicate.value === labelUri &&
          quad.object.termType === 'NamedNode' &&
          quad.object.value === ref
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

  const addLabel = async (ref: string, labelUri: string) => {
    if (props.semanticsUpdated && store) {
      const THIS_POST = DataFactory.namedNode(THIS_POST_NAME);
      const labelNode = DataFactory.namedNode(labelUri);
      const refNode = DataFactory.namedNode(ref);

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

  if (props.isLoading) {
    return (
      <Box gap="10px" pad={{ vertical: '8px' }}>
        <LoadingDiv
          height={'24px'}
          style={{ borderRadius: '12px', width: '120px' }}></LoadingDiv>

        <LoadingDiv
          height={'80px'}
          style={{ borderRadius: '12px', width: '100%' }}></LoadingDiv>
      </Box>
    );
  }

  if (!props.originalParsed) {
    return <></>;
  }

  const allRefs = Array.from(refs.entries());
  const [visibleRefs, restOfRefs] =
    size === 'compact' ? splitArray(allRefs, 2) : [allRefs, []];

  if (refs && refs.size > 0) {
    return (
      <Box margin={{ top: 'small' }}>
        <Box style={{ display: 'block' }}>
          <Box gap="16px">
            {visibleRefs.map(([ref, refData], index) => {
              if (!props.originalParsed)
                throw new Error('Unexpected undefined');

              return (
                <RefWithLabels
                  ix={index}
                  editable={props.editable}
                  key={ref}
                  refUrl={ref}
                  refData={refData}
                  support={props.originalParsed?.support}
                  removeLabel={(labelUri: string) => removeLabel(ref, labelUri)}
                  addLabel={(labelUri: string) => addLabel(ref, labelUri)}
                  allRefs={visibleRefs}></RefWithLabels>
              );
            })}
          </Box>
          {restOfRefs.length > 0 && (
            <AppLabel
              margin={{ top: '16px' }}
              colors={{
                font: '#6B7280',
                background: 'transparent',
                border: 'transparent',
              }}
              style={{
                borderRadius: '4px',
                border: 'none',
              }}>{`+ ${restOfRefs.length} Reference${restOfRefs.length > 1 ? 's' : ''}`}</AppLabel>
          )}
        </Box>
      </Box>
    );
  }

  return <></>;
};
