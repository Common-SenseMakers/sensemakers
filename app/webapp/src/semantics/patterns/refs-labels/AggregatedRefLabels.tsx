import { useMemo } from 'react';

import { OntologyItem } from '../../../shared/types/types.parser';
import { RefLabel } from '../../../shared/types/types.references';
import { transformDisplayName } from '../../../shared/utils/semantics.helper';
import { LabelColors } from '../../../ui-components';
import { AppLabelsEditor } from '../../../ui-components/AppLabelsEditor';

interface LabelDetails {
  count: number;
}

export const AggregatedRefLabels = (props: {
  refLabels: RefLabel[];
  onLabelClick?: (label: string) => void;
  ontology?: OntologyItem[];
}) => {
  const labelsSummary = useMemo(() => {
    const ontology = props.ontology;

    const summaryMap = new Map<string, LabelDetails>();

    props.refLabels.forEach((refLabel) => {
      const current: LabelDetails = summaryMap.get(refLabel.label) || {
        count: 0,
      };
      const newDetails: LabelDetails = { count: current.count + 1 };

      summaryMap.set(refLabel.label, newDetails);
    });

    const labelsSummary = Array.from(summaryMap.entries())
      .map(([labelUri, details]) => {
        const label_ontology = ontology
          ? ontology.find((item) => item.uri === labelUri)
          : undefined;

        if (!label_ontology) {
          return undefined;
        }

        return {
          label: transformDisplayName(label_ontology.display_name),
          details,
        };
      })
      .filter((s) => s !== undefined) as {
      label: string;
      details: LabelDetails;
    }[];

    return labelsSummary.sort((a, b) => {
      if (a.label === '💬 mentions') {
        return -1;
      }
      return b.details.count - a.details.count;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.refLabels]);

  const colors: LabelColors = {
    font: '#337FBD',
    background: '#FFFFFF',
    border: '#D1D5DB',
  };

  return (
    <AppLabelsEditor
      placeholder=""
      colors={colors}
      onLabelClick={props.onLabelClick}
      labels={labelsSummary.map((labelDetails) => (
        <span>
          {`${labelDetails.label}`}
          <span style={{ marginLeft: '8px', marginRight: '4px' }}>
            {labelDetails.details.count}
          </span>
        </span>
      ))}></AppLabelsEditor>
  );
};
