import { Box } from 'grommet';
import { DataFactory } from 'n3';
import { usePostHog } from 'posthog-js/react';
import { useMemo } from 'react';

import { POSTHOG_EVENTS } from '../../../analytics/posthog.events';
import { useOverlay } from '../../../overlays/OverlayContext';
import { isPlatformPost } from '../../../shared/utils/links.utils';
import { filterStore, writeRDF } from '../../../shared/utils/n3.utils';
import {
  THIS_POST_NAME_URI,
  parseRefDisplayMeta,
} from '../../../shared/utils/semantics.helper';
import { AppLabel } from '../../../ui-components';
import { REF_LABELS_EDITOR_ID } from '../../../ui-components/AppLabelsEditor';
import { LoadingDiv } from '../../../ui-components/LoadingDiv';
import { useThemeContext } from '../../../ui-components/ThemedApp';
import { splitArray } from '../../../ui-components/utils';
import { getPostType } from '../../../utils/post.utils';
import { useSemanticsStore } from '../common/use.semantics';
import { PatternProps, PostClickTarget } from '../patterns';
import { QuotedPostLabel } from './QuotedPostLabel';
import { RefWithLabels } from './RefWithLabels';
import { RefsMap, processSemantics } from './process.semantics';

export interface RefLabelsCustomProps {
  showAggregatedLabels?: boolean;
}

export const RefLabelsComponent = (
  props: PatternProps<RefLabelsCustomProps>
) => {
  const posthog = usePostHog();
  const { store, originalStore } = useSemanticsStore(
    props.semantics,
    props.originalParsed
  );
  const { constants } = useThemeContext();
  const size = props.size || 'normal';

  const overlay = useOverlay();

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement>,
    ref: string
  ) => {
    posthog?.capture(POSTHOG_EVENTS.CLICKED_REFERENCE_PAGE, {
      ref,
      postId: props.post?.id,
    });
    let target = event.target as HTMLElement;

    // filter clicks on the ref semantics
    while (target !== null) {
      if (target.id === REF_LABELS_EDITOR_ID) {
        return; // Stop further processing
      }

      target = target.parentNode as HTMLElement;
    }
    overlay &&
      overlay.onPostClick({ target: PostClickTarget.REF, payload: ref });
  };

  /** processed ref labels with metadata */
  const refs = useMemo<RefsMap>(
    () =>
      originalStore && store && props.originalParsed
        ? processSemantics(
            originalStore,
            store,
            props.originalParsed?.support,
            props.post
          )
        : (new Map() as RefsMap),
    [originalStore, props.originalParsed, store, props.post]
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
      const THIS_POST = DataFactory.namedNode(THIS_POST_NAME_URI);
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

  if (props.isLoading) {
    return (
      <Box gap="10px" pad={{ vertical: '8px' }}>
        <LoadingDiv
          height={'24px'}
          style={{ borderRadius: '12px', width: '120px' }}></LoadingDiv>

        <LoadingDiv
          height={'80px'}
          style={{ borderRadius: '12px', width: '100%' }}></LoadingDiv>
      </Box>
    );
  }

  if (!props.originalParsed) {
    return <></>;
  }

  const allRefs = Array.from(refs.entries());
  const [visibleRefs, restOfRefs] =
    size === 'compact' ? splitArray(allRefs, 1) : [allRefs, []];

  if (refs && refs.size > 0) {
    return (
      <Box>
        <Box style={{ display: 'block' }}>
          <Box gap="16px">
            {visibleRefs.map(([ref, refData], index) => {
              if (!props.originalParsed)
                throw new Error('Unexpected undefined');

              const refDisplayMeta = props.post?.meta?.references[ref];
              const { postsIds } = parseRefDisplayMeta(refDisplayMeta);

              // here we get the author labels directly from the semantics of the post.
              const authorLabels = refs.get(ref)?.labelsUris || [];
              const hasOtherLabels = postsIds.length > 1;

              const isQuotedPost = isPlatformPost(ref);

              return (
                refDisplayMeta?.oembed && (
                  <div key={index}>
                    {isQuotedPost && (
                      <QuotedPostLabel
                        color={constants.colors.textLight2}
                        postType={getPostType(props.post)}
                      />
                    )}
                    <Box
                      style={{
                        borderRadius: '12px',
                        border: '1.6px solid #D1D5DB',
                        width: '100%',
                      }}
                      pad="12px"
                      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                        handleClick(e, ref)
                      }>
                      <RefWithLabels
                        ix={index}
                        oembed={refDisplayMeta.oembed}
                        authorLabels={authorLabels}
                        aggregatedLabels={refDisplayMeta.aggregatedLabels}
                        showAggregatedLabels={
                          props.custom?.showAggregatedLabels && hasOtherLabels
                        }
                        showDescription={isQuotedPost}
                        showAllMentionsText={true}
                        editable={props.editable}
                        ontology={
                          props.originalParsed?.support?.ontology
                            ?.semantic_predicates
                        }
                        removeLabel={(labelUri: string) => {
                          removeLabel(ref, labelUri).catch(console.error);
                        }}
                        addLabel={(labelUri: string) => {
                          addLabel(ref, labelUri).catch(console.error);
                        }}></RefWithLabels>
                    </Box>
                  </div>
                )
              );
            })}
          </Box>
          {restOfRefs.length > 0 && (
            <AppLabel
              margin={{ top: '16px' }}
              colors={{
                font: '#6B7280',
                background: 'transparent',
                border: 'transparent',
              }}
              style={{
                borderRadius: '4px',
                border: 'none',
              }}>{`+ ${restOfRefs.length} Reference${restOfRefs.length > 1 ? 's' : ''}`}</AppLabel>
          )}
        </Box>
      </Box>
    );
  }

  return <></>;
};
