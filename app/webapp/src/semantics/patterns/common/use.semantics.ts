import { Parser, Store } from 'n3';
import { useEffect, useState } from 'react';

import { parseRDF } from '../../../shared/utils/n3.utils';
import { PatternProps } from '../patterns';

/** construct RDF Store synchronously */
export const semanticStringToStore = (semantics?: string) => {
  const parser = new Parser();
  const store = new Store();
  if (!semantics) return store;

  const quads = parser.parse(semantics);
  store.addQuads(quads);
  return store;
};

export const useSemanticsStore = (props: PatternProps) => {
  const [store, setStore] = useState<Store>(
    semanticStringToStore(props.semantics)
  );
  const [originalStore, setOriginalStore] = useState<Store>(
    semanticStringToStore(props.originalParsed?.semantics)
  );

  useEffect(() => {
    if (props.originalParsed) {
      parseRDF(props.originalParsed.semantics).then((_store) => {
        /** both stores are set to the same value if not semantics are provided */
        setOriginalStore(_store);
        if (!props.semantics) setStore(_store);
      });
    }
  }, [props.originalParsed, props.semantics]);

  useEffect(() => {
    /** then the actual stored is set. If prop.semantics is provided */
    if (!props.semantics) {
      setStore(originalStore);
    } else {
      parseRDF(props.semantics).then((_store) => setStore(_store));
    }
  }, [originalStore, props.semantics]);
  return { store, originalStore };
};
