import { Box } from 'grommet';
import { useMemo } from 'react';

import { ParserOntology, RefMeta } from '../../../shared/types/types.parser';
import { RefLabel } from '../../../shared/types/types.references';
import { AppLabelsEditor } from '../../../ui-components/AppLabelsEditor';
import { LoadingDiv } from '../../../ui-components/LoadingDiv';
import { RefCard } from '../common/RefCard';
import { AggregatedRefLabels } from './AggregatedRefLabels';
import { RefData } from './process.semantics';

/** renders the labels for one ref */
export const RefWithLabels = (props: {
  ix: number;
  refUrl: string;
  refData: RefData;
  showLabels?: boolean;
  showDescription?: boolean;
  ontology?: ParserOntology;
  addLabel: (labelUri: string) => void;
  removeLabel: (labelUri: string) => void;
  editable?: boolean;
  allRefs: [string, RefData][];
  refLabels?: RefLabel[];
  authorProfileId?: string;
}) => {
  const labelsOntology = props.ontology?.semantic_predicates;
  const refData = props.refData;
  const { showLabels } =
    props.showLabels !== undefined ? props : { showLabels: true };

  /** display names for selected labels */
  let labelsDisplayNames = useMemo(
    () =>
      refData.labelsUris.map((labelUri) => {
        const label_ontology = labelsOntology
          ? labelsOntology.find((item) => item.uri === labelUri)
          : undefined;

        if (!label_ontology)
          throw new Error(`Unexpected ontology not found for ${labelUri}`);

        return label_ontology.display_name;
      }),
    [labelsOntology, refData.labelsUris]
  );

  // make labelsDisplayNames unique
  labelsDisplayNames = Array.from(new Set(labelsDisplayNames));

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

  const refLabels = props.refLabels;

  const show =
    refLabels &&
    refLabels.find(
      (refLabel) => refLabel.authorProfileId !== props.authorProfileId
    ) !== undefined;

  return (
    <>
      {refData.meta ? (
        <RefCard
          ix={props.ix + 1}
          url={props.refUrl}
          title={refData.meta?.title}
          description={
            props.showDescription ? refData.meta?.description : undefined
          }
          image={refData.meta?.thumbnail_url}
          refType={
            refData.meta.item_type !== 'unknown'
              ? refData.meta.item_type
              : undefined
          }
          showDescription={props.showDescription}
          sourceRef={getSourceRefNumber(refData.meta, props.allRefs)}></RefCard>
      ) : (
        <Box gap="10px" pad={{ vertical: '8px' }}>
          <LoadingDiv
            height={'16px'}
            style={{ borderRadius: '12px', width: '120px' }}></LoadingDiv>

          <LoadingDiv
            height={'76px'}
            style={{ borderRadius: '12px', width: '100%' }}></LoadingDiv>
        </Box>
      )}

      {show ? (
        <Box margin={{ top: '22px' }}>
          <AggregatedRefLabels
            refLabels={refLabels}
            ontology={props.ontology}></AggregatedRefLabels>
        </Box>
      ) : (
        <></>
      )}

      <Box margin={{ top: '16px' }}>
        {showLabels && (
          <AppLabelsEditor
            editable={props.editable}
            colors={{
              font: '#FFFFFF',
              background: '#337FBD',
              border: '#5293C7',
            }}
            labels={labelsDisplayNames}
            options={optionDisplayNames}
            removeLabel={(label) => removeLabel(label)}
            addLabel={(label) => addLabel(label)}></AppLabelsEditor>
        )}
      </Box>
    </>
  );
};

const getSourceRefNumber = (meta: RefMeta, allRefs: [string, RefData][]) => {
  const refSource = allRefs.find(([ref]) => ref === meta.ref_source_url);
  return refSource?.[1].meta?.order ? refSource[1].meta.order : undefined;
};
