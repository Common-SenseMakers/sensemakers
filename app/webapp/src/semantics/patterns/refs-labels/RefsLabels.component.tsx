import { Box } from 'grommet';
import { DataFactory } from 'n3';
import { useMemo } from 'react';

import { THIS_POST_NAME } from '../../../app/config';
import { filterStore, writeRDF } from '../../../shared/n3.utils';
import { useSemanticsStore } from '../common/use.semantics';
import { PatternProps } from '../patterns';
import { RefLabels } from './RefLabel';
import { RefsMap, processSemantics } from './process.semantics';

export const RefLabelsComponent = (props: PatternProps) => {
  const { store, originalStore } = useSemanticsStore(props);

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

  if (!props.originalParsed) {
    return <></>;
  }

  if (refs && refs.size > 0) {
    return (
      <Box margin={{ top: 'small' }}>
        <Box style={{ display: 'block' }}>
          <Box gap="large">
            {Array.from(refs.entries()).map(([ref, refData], ixref) => {
              if (!props.originalParsed)
                throw new Error('Undexpected undefined');

              return (
                <RefLabels
                  key={ixref}
                  refUrl={ref}
                  refData={refData}
                  support={props.originalParsed?.support}
                  removeLabel={(labelUri: string) => removeLabel(ref, labelUri)}
                  addLabel={(labelUri: string) =>
                    addLabel(ref, labelUri)
                  }></RefLabels>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }

  return <></>;
};
