import {
  BlankNode,
  DataFactory,
  Literal,
  NamedNode,
  OTerm,
  Parser,
  Quad,
  Quad_Object,
  Quad_Predicate,
  Quad_Subject,
  Store,
  Variable,
  Writer,
} from 'n3';

export const parseRDF = (text: string): Promise<Store> => {
  return new Promise((resolve, reject) => {
    const parser = new Parser();
    const store = new Store();

    parser.parse(text, (error, quad, prefixes) => {
      if (quad) {
        store.addQuad(quad);
      } else if (error) {
        console.error(error);
      } else {
        resolve(store);
      }
    });
  });
};

export const writeRDF = async (store: Store): Promise<string | undefined> => {
  const writer = new Writer({ format: 'N-Triples' });
  store.forEach((quad) => writer.addQuad(quad), null, null, null, null);

  return new Promise((resolve, reject) => {
    writer.end((error, result?: string) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

export const mapStore = (
  store: Store,
  callback: (q: Quad) => Quad,
  subject: OTerm = null,
  predicate: OTerm = null,
  object: OTerm = null,
  graph: OTerm = null
) => {
  const newStore = new Store();

  store.forEach(
    (quad) => {
      const newQuad = callback(quad);
      newStore.addQuad(newQuad);
    },
    subject,
    predicate,
    object,
    graph
  );

  return newStore;
};

export const mapStoreElements = <T>(
  store: Store,
  callback: (q: Quad) => T,
  subject: OTerm = null,
  predicate: OTerm = null,
  object: OTerm = null,
  graph: OTerm = null
) => {
  const output: T[] = [];

  store.forEach(
    (quad) => {
      output.push(callback(quad));
    },
    subject,
    predicate,
    object,
    graph
  );

  return output;
};

export const filterStore = (
  store: Store,
  callback: (q: Quad) => boolean,
  subject: OTerm = null,
  predicate: OTerm = null,
  object: OTerm = null,
  graph: OTerm = null
) => {
  const newStore = new Store();

  store.forEach(
    (quad) => {
      if (callback(quad)) {
        newStore.addQuad(quad);
      }
    },
    subject,
    predicate,
    object,
    graph
  );

  return newStore;
};

export const forEachStore = (
  store: Store,
  callback: (q: Quad) => void,
  subject: OTerm = null,
  predicate: OTerm = null,
  object: OTerm = null,
  graph: OTerm = null
) => {
  return store.forEach(callback, subject, predicate, object, graph);
};

/**
 * from a dictionary of values, return a node of the same type if the value
 * is a key in the dictionary with the dictionary value for that key */
const replaceNode = (
  node: NamedNode | BlankNode | Variable | Literal,
  replaceMap: Record<string, string>
): NamedNode | BlankNode | Variable | Literal => {
  if (replaceMap[node.value]) {
    if (node.termType === 'NamedNode') {
      return DataFactory.namedNode(replaceMap[node.value]);
    }
    if (node.termType === 'BlankNode') {
      return DataFactory.blankNode(replaceMap[node.value]);
    }
    if (node.termType === 'Literal') {
      return DataFactory.literal(replaceMap[node.value]);
    }
    if (node.termType === 'Variable') {
      return DataFactory.variable(replaceMap[node.value]);
    }
  }

  return node;
};

export const replaceNodes = (
  store: Store,
  replaceMap: Record<string, string>
) => {
  const newStore = mapStore(store, (quad) => {
    let { subject, predicate, object, graph } = quad;

    return DataFactory.quad(
      replaceNode(subject, replaceMap) as Quad_Subject,
      replaceNode(predicate, replaceMap) as Quad_Predicate,
      replaceNode(object, replaceMap) as Quad_Object,
      graph
    );
  });

  return newStore;
};
