import { Parser, Store } from 'n3';
import { useEffect, useState } from 'react';

import { parseRDF } from '../../../shared/utils/n3.utils';

const DEBUG = false;

/** construct RDF Store synchronously */
export const semanticStringToStore = (semantics?: string) => {
  const parser = new Parser();
  const store = new Store();
  if (!semantics) return store;

  const quads = parser.parse(semantics);
  store.addQuads(quads);
  return store;
};

export const useSemanticsStore = (props: {
  semantics?: string;
  originalParsed?: { semantics: string };
}) => {
  const [store, setStore] = useState<Store>(
    semanticStringToStore(props.semantics)
  );
  const [originalStore, setOriginalStore] = useState<Store>(
    semanticStringToStore(props.originalParsed?.semantics)
  );

  useEffect(() => {
    if (props.originalParsed) {
      if (DEBUG)
        console.log('updating original store', {
          originalStore,
        });
      parseRDF(props.originalParsed.semantics)
        .then((_store) => {
          /** both stores are set to the same value if no semantics are provided */
          if (DEBUG)
            console.log('setting original store', {
              _store,
            });
          setOriginalStore(_store);
          if (!props.semantics) {
            if (DEBUG)
              console.log('setting store (equal to original)', {
                _store,
              });
            setStore(_store);
          }
        })
        .catch(console.error);
    }
  }, [originalStore, props.originalParsed, props.semantics]);

  useEffect(() => {
    /** then the actual stored is set. If prop.semantics is provided */
    if (!props.semantics) {
      if (DEBUG)
        console.log('updating semantics store - use originalStore', {
          originalStore,
        });

      setStore(originalStore);
    } else {
      if (DEBUG)
        console.log('updating semantics store - use semantics', {
          semantics: props.semantics,
        });

      parseRDF(props.semantics)
        .then((_store) => {
          if (DEBUG)
            console.log('setting semantics store', {
              store: _store,
            });
          setStore(_store);
        })
        .catch(console.error);
    }
  }, [originalStore, props.semantics]);
  return { store, originalStore };
};
