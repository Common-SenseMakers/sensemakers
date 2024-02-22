import { Box } from 'grommet';
import { useEffect } from 'react';

import { constructPostNanopub } from '../nanopubs/construct.post.nanopub';
import sample_result from '../sample.result.json';
import { AppButton } from '../ui-components';
import { useAccountContext } from './AccountContext';
import { useNanopubContext } from './NanopubContext';
import { NANOPUBS_SERVER } from './config';

export const AppTest = (props: {}) => {
  const { connectedUser } = useAccountContext();
  const { profile } = useNanopubContext();
  const start = async () => {
    // const semantics = `<http://example.org/subject2> <http://example.org/subject1> "cancer-research"@en .`;
    // const semantics = `<http://example.org/subject3> <http://example.org/subject1> "cancer-research" . \n <http://example.org/subject3> <https://sparontologies.github.io/cito/current/Keyword> "science" . \n <http://example.org/subject3> <https://sparontologies.github.io/cito/current/Label> <https://abook.com/> .`;
    // const semantics = `<http://example.org/subject1> <http://example.org/predicate1> <http://example.org/object1> . <http://example.org/subject2> <http://example.org/predicate2> "Literal value"@en . <http://example.org/subject3> <http://example.org/predicate3> "2024-02-16"^^<http://www.w3.org/2001/XMLSchema#date> .`;

    // const store = new Store();

    // ['a', 'b'].forEach((e) => {
    //   const sub = DataFactory.blankNode('text-input');
    //   const pre = DataFactory.namedNode(`predicate-${e}`);
    //   const obj = DataFactory.namedNode(e);
    //   const graph = DataFactory.defaultGraph();
    //   const quad = DataFactory.quad(sub, pre, obj, graph);

    //   store.add(quad);
    // });

    // const semantics = await writeRDF(store);

    const semantics = sample_result.semantics;

    if (!semantics) throw new Error();

    if (!connectedUser) throw new Error('User not connected');
    const nanopub = await constructPostNanopub(
      'A text',
      connectedUser,
      semantics
    );

    console.log({ semantics, nanopub });

    if (profile) {
      const published = await nanopub.publish(profile, NANOPUBS_SERVER);
      console.log({ info: published.info() });
    }
  };

  return (
    <Box>
      <AppButton label="run" onClick={() => start()}></AppButton>
    </Box>
  );
};
