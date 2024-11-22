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

/** keeps a semantics n3 store in sync with the semantics string provided as input,
 * if originalParsed is provided it will also create the corresponding original store
 */
export const useSemanticsStore = (
  semantics?: string,
  originalParsed?: { semantics: string }
) => {
  const [store, setStore] = useState<Store>(semanticStringToStore(semantics));
  const [originalStore, setOriginalStore] = useState<Store>(
    semanticStringToStore(originalParsed?.semantics)
  );

  /**  */
  useEffect(() => {
    if (originalParsed) {
      if (DEBUG)
        console.log('updating original store', {
          originalStore,
        });
      parseRDF(originalParsed.semantics)
        .then((_store) => {
          /** both stores are set to the same value if no semantics are provided */
          if (DEBUG)
            console.log('setting original store', {
              _store,
            });
          setOriginalStore(_store);
          if (!semantics) {
            if (DEBUG)
              console.log('setting store (equal to original)', {
                _store,
              });
            setStore(_store);
          }
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalParsed, semantics]);

  useEffect(() => {
    /** then the actual stored is set. If prop.semantics is provided */
    if (!semantics) {
      if (DEBUG)
        console.log('updating semantics store - use originalStore', {
          originalStore,
        });

      setStore(originalStore);
    } else {
      if (DEBUG)
        console.log('updating semantics store - use semantics', {
          semantics: semantics,
        });

      parseRDF(semantics)
        .then((_store) => {
          if (DEBUG)
            console.log('setting semantics store', {
              store: _store,
            });
          setStore(_store);
        })
        .catch(console.error);
    }
  }, [originalStore, semantics]);
  return { store, originalStore };
};
