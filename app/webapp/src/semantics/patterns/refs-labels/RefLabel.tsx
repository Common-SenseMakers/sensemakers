import { Anchor, Box } from 'grommet';
import { useMemo } from 'react';

import { ParsedSupport, RefMeta } from '../../../shared/types/types.parser';
import { AppLabelsEditor } from '../../../ui-components/AppLabelsEditor';
import { useThemeContext } from '../../../ui-components/ThemedApp';
import { RefCard } from '../common/RefCard';
import { RefData } from './process.semantics';

const DEBUG = false;

/** renders the labels for one ref */
export const RefWithLabels = (props: {
  ix: number;
  refUrl: string;
  refData: RefData;
  support?: ParsedSupport;
  addLabel: (labelUri: string) => void;
  removeLabel: (labelUri: string) => void;
  editable?: boolean;
  allRefs: [string, RefData][];
}) => {
  const labelsOntology = props.support?.ontology?.semantic_predicates;
  const refData = props.refData;

  /** display names for selected labels */
  const labelsDisplayNames = useMemo(
    () =>
      refData.labelsUris.map((labelUri) => {
        const label_ontology = labelsOntology
          ? labelsOntology.find((item) => item.uri === labelUri)
          : undefined;

        if (!label_ontology)
          throw new Error(`Unexpected ontology not found for ${labelUri}`);

        return label_ontology.display_name as string;
      }),
    [labelsOntology, refData.labelsUris]
  );

  /** list of possible labels from ontology (filtering those selected) */
  const optionDisplayNames = useMemo(
    () =>
      labelsOntology
        ? labelsOntology
            .filter((l) => !refData.labelsUris.includes(l.uri))
            .map((l) => l.display_name)
        : undefined,
    [labelsOntology, refData.labelsUris]
  );

  const getLabelFromDisplayName = (displayName: string) => {
    const item = labelsOntology
      ? labelsOntology.find((l) => l.display_name === displayName)
      : undefined;
    if (!item)
      throw new Error(
        `Unexpected label with display_name equal to ${displayName} not found`
      );
    return item;
  };

  /** converts display name into label uri and calls its removal */
  const removeLabel = (label: string) => {
    props.removeLabel(getLabelFromDisplayName(label).uri);
  };

  /** converts display name into label uri and calls its addition */
  const addLabel = (label: string) => {
    props.addLabel(getLabelFromDisplayName(label).uri);
  };

  return (
    <Box>
      <Box direction="row" margin={{ bottom: 'small' }}>
        <AppLabelsEditor
          editable={props.editable}
          colors={{ font: '#337FBD', background: '#EDF7FF', border: '#ADCCE4' }}
          labels={labelsDisplayNames}
          options={optionDisplayNames}
          removeLabel={(label) => removeLabel(label)}
          addLabel={(label) => addLabel(label)}></AppLabelsEditor>
      </Box>
      {refData.meta ? (
        <RefCard
          ix={props.ix + 1}
          url={props.refUrl}
          title={refData.meta?.title}
          description={refData.meta?.summary}
          image={refData.meta?.image}
          refType={refData.meta.item_type}
          sourceRef={getSourceRefNumber(refData.meta, props.allRefs)}></RefCard>
      ) : (
        <Anchor target="_blank" href={props.refUrl}>
          {props.refUrl}
        </Anchor>
      )}
    </Box>
  );
};

const getSourceRefNumber = (meta: RefMeta, allRefs: [string, RefData][]) => {
  const currRefData = allRefs.find(([ref]) => ref === meta.url);

  const refSource = allRefs.find(
    ([ref]) => ref === currRefData?.[1].meta?.ref_source_url
  );
  return refSource?.[1].meta?.order ? refSource[1].meta.order : undefined;
};
