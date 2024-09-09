import { Dispatch, SetStateAction, useState } from 'react';

import { useAppFetch } from '../../api/app.fetch';
import { PublishPostPayload } from '../../shared/types/types.fetch';
import {
  PlatformPostDraftApproval,
  PlatformPostSignerType,
} from '../../shared/types/types.platform.posts';
import {
  AppPostRepublishedStatus,
  UnpublishPlatformPostPayload,
} from '../../shared/types/types.posts';
import { PLATFORM } from '../../shared/types/types.user';
import { useNanopubContext } from '../../user-login/contexts/platforms/nanopubs/NanopubContext';
import { PostFetchContext } from './use.post.fetch';
import { PostMergeContext } from './use.post.merge';
import { PostUpdateContext } from './use.post.update';

export interface PostPublishContext {
  publishOrRepublish: () => Promise<void>;
  retractNanopublication: () => Promise<void>;
  isRetracting: boolean;
  errorApprovingMsg?: string;
  publishIntent: boolean;
  setPublishIntent: Dispatch<SetStateAction<boolean>>;
  unpublishIntent: boolean;
  setUnpublishIntent: Dispatch<SetStateAction<boolean>>;
}

export const usePostPublish = (
  merged: PostMergeContext,
  update: PostUpdateContext
): PostPublishContext => {
  const appFetch = useAppFetch();

  const [publishIntent, setPublishIntent] = useState<boolean>(false);
  const [unpublishIntent, setUnpublishIntent] = useState<boolean>(false);

  const [errorApprovingMsg, setErrorApprovingMsg] = useState<
    string | undefined
  >(undefined);

  const [isRetracting, setIsRetracting] = useState(false);

  const { signNanopublication } = useNanopubContext();

  const publishOrRepublish = async () => {
    const nanopub = merged.post?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );
    const allOtherMirrors = merged.post?.mirrors.filter(
      (m) => m.platformId !== PLATFORM.Nanopub
    );

    if (!nanopub || !nanopub.draft) {
      throw new Error(`Unexpected nanopub mirror not found`);
    }

    if (nanopub.draft.signerType === PlatformPostSignerType.USER) {
      if (!signNanopublication) {
        throw new Error(`Unexpected signNanopublication undefined`);
      }

      const signed = await signNanopublication(nanopub.draft.unsignedPost);
      nanopub.draft.signedPost = signed.rdf();
    }

    /** approve is set the first time a post is published (should be set
     * also set in the backend anyway) */
    if (
      merged.post &&
      merged.post.republishedStatus === AppPostRepublishedStatus.PENDING
    ) {
      nanopub.draft.postApproval = PlatformPostDraftApproval.APPROVED;
      // removeDraft(post.id);
    }

    if (merged.post) {
      if (errorApprovingMsg) {
        setErrorApprovingMsg(undefined);
      }
      try {
        await appFetch<void, PublishPostPayload>('/api/posts/approve', {
          post: {
            ...merged.post,
            mirrors: [...(allOtherMirrors ? allOtherMirrors : []), nanopub],
          },
          platformIds: [PLATFORM.Nanopub],
        });
      } catch (e: any) {
        setErrorApprovingMsg(e.message);
        update.setIsUpdating(false);
      }
    }

    update.setEnabledEdit(false);
  };

  const retractNanopublication = async () => {
    setIsRetracting(true);

    const nanopub = merged.post?.mirrors.find(
      (m) => m.platformId === PLATFORM.Nanopub
    );

    if (!nanopub || !nanopub.post_id) {
      throw new Error(`Unexpected nanopub mirror not found`);
    }

    if (!nanopub.deleteDraft) {
      throw new Error(`Delete draft not available`);
    }

    if (nanopub.deleteDraft.signerType === PlatformPostSignerType.USER) {
      if (!signNanopublication) {
        throw new Error(`Unexpected signNanopublication undefined`);
      }

      const signed = await signNanopublication(
        nanopub.deleteDraft.unsignedPost
      );
      nanopub.deleteDraft.signedPost = signed.rdf();
    }

    nanopub.deleteDraft.postApproval = PlatformPostDraftApproval.APPROVED;

    if (merged.post?.id) {
      if (errorApprovingMsg) {
        setErrorApprovingMsg(undefined);
      }
      try {
        await appFetch<void, UnpublishPlatformPostPayload>(
          '/api/posts/unpublish',
          {
            post_id: nanopub.post_id,
            platformId: PLATFORM.Nanopub,
            postId: merged.post.id,
          }
        );
      } catch (e: any) {
        setErrorApprovingMsg(e.message);
        setIsRetracting(false);
      }
    }

    // setIsUpdating(false); should be set by the re-fetch flow
    // setIsRetracting(false); should be set by the re-fetch flow
  };

  return {
    publishOrRepublish,
    retractNanopublication,
    isRetracting,
    errorApprovingMsg,
    publishIntent,
    setPublishIntent,
    unpublishIntent,
    setUnpublishIntent,
  };
};
