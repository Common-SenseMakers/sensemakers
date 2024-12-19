import { Box } from 'grommet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { PostEditKeys } from '../../../i18n/i18n.edit.post';
import { ParserOntology } from '../../../shared/types/types.parser';
import { OEmbed, RefLabel } from '../../../shared/types/types.references';
import { LINKS_TO_URI } from '../../../shared/utils/semantics.helper';
import { AppLabelsEditor } from '../../../ui-components/AppLabelsEditor';
import { LoadingDiv } from '../../../ui-components/LoadingDiv';
import { RefCard } from '../common/RefCard';
import { AggregatedRefLabels } from './AggregatedRefLabels';

/** renders the labels for one ref */
export const RefWithLabels = (props: {
  ix: number;
  oembed: OEmbed;
  authorLabels: string[];
  aggregatedLabels?: RefLabel[];
  showAggregatedLabels?: boolean;
  showAuthorLabels?: boolean;
  showDescription?: boolean;
  addLabel: (labelUri: string) => void;
  removeLabel: (labelUri: string) => void;
  editable?: boolean;
  ontology?: ParserOntology;
}) => {
  const { t } = useTranslation();
  const labelsOntology = props.ontology?.semantic_predicates;

  /** display names for selected labels */
  let labelsDisplayNames = useMemo(
    () =>
      props.authorLabels
        .filter((labelUri) => labelUri !== LINKS_TO_URI)
        .map((labelUri) => {
          const label_ontology = labelsOntology
            ? labelsOntology.find((item) => item.uri === labelUri)
            : undefined;

          if (!label_ontology)
            throw new Error(`Unexpected ontology not found for ${labelUri}`);

          return label_ontology.display_name;
        }),
    [labelsOntology, props.authorLabels]
  );

  // make labelsDisplayNames unique
  labelsDisplayNames = Array.from(new Set(labelsDisplayNames));

  /** list of possible labels from ontology (filtering those selected) */
  const optionDisplayNames = useMemo(
    () =>
      labelsOntology
        ? labelsOntology
            .filter((l) => !props.authorLabels.includes(l.uri))
            .map((l) => l.display_name)
        : undefined,
    [labelsOntology, props.authorLabels]
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
    <>
      {props.oembed ? (
        <RefCard
          ix={props.ix + 1}
          url={props.oembed.url}
          title={props.oembed.title}
          description={
            props.showDescription ? props.oembed.description : undefined
          }
          image={props.oembed.thumbnail_url}
          refType={
            props.oembed.type !== 'unknown' ? props.oembed.type : undefined
          }
          showDescription={props.showDescription}></RefCard>
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

      {props.showAggregatedLabels !== false &&
      props.aggregatedLabels &&
      props.aggregatedLabels.length > 0 ? (
        <Box margin={{ top: '22px' }}>
          <AggregatedRefLabels
            refLabels={props.aggregatedLabels.filter(
              (refLabel) => refLabel.label !== LINKS_TO_URI
            )}
            ontology={props.ontology}></AggregatedRefLabels>
        </Box>
      ) : (
        <></>
      )}

      <Box margin={{ top: '16px' }}>
        {props.showAuthorLabels !== false && (
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
            addLabel={(label) => addLabel(label)}
            placeholder={
              props.editable ? t(PostEditKeys.labelsPlaceholder) : ''
            }></AppLabelsEditor>
        )}
      </Box>
    </>
  );
};
