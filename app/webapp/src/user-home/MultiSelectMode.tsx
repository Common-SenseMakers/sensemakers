import { Box, CheckBox } from 'grommet';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppFetch } from '../api/app.fetch';
import { AppModalStandard } from '../app/AppModalStandard';
import { I18Keys } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { usePost } from '../post/PostContext';
import { AppPostFull, AppPostReviewStatus } from '../shared/types/types.posts';
import { AppButton } from '../ui-components';

interface MultiSelectModeProps {
  posts: AppPostFull[];
}

export const MultiSelectMode: React.FC<MultiSelectModeProps> = ({ posts }) => {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [action, setAction] = useState<'ignore' | 'publish' | null>(null);
  const { t } = useTranslation();
  const appFetch = useAppFetch();

  const handleSelect = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleAction = (actionType: 'ignore' | 'publish') => {
    setAction(actionType);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (action === 'ignore') {
      await Promise.all(
        selectedPosts.map((postId) =>
          appFetch('/api/posts/update', {
            postId,
            postUpdate: { reviewedStatus: AppPostReviewStatus.IGNORED },
          })
        )
      );
    } else if (action === 'publish') {
      await Promise.all(
        selectedPosts.map((postId) =>
          appFetch('/api/posts/update', {
            postId,
            postUpdate: { reviewedStatus: AppPostReviewStatus.PENDING },
          })
        )
      );
    }
    setSelectedPosts([]);
    setShowConfirmModal(false);
  };

  return (
    <>
      {posts.map((post) => (
        <Box key={post.id} direction="row" align="center">
          <CheckBox
            checked={selectedPosts.includes(post.id)}
            onChange={() => handleSelect(post.id)}
          />
          <Box flex>
            <PostCard
              post={post}
              handleClick={() => {}} // Disable navigation in multi-select mode
            />
          </Box>
        </Box>
      ))}
      <Box
        direction="row"
        justify="center"
        gap="medium"
        margin={{ top: 'medium' }}>
        <AppButton
          onClick={() => handleAction('ignore')}
          label={t(I18Keys.ignore)}
          disabled={selectedPosts.length === 0}
        />
        <AppButton
          onClick={() => handleAction('publish')}
          label={t(I18Keys.publish)}
          disabled={selectedPosts.length === 0}
        />
      </Box>
      {showConfirmModal && (
        <AppModalStandard
          onModalClosed={() => setShowConfirmModal(false)}
          type="normal"
          contentProps={{
            type: 'normal',
            title:
              action === 'ignore'
                ? t(I18Keys.ignoreConfirmTitle)
                : t(I18Keys.publishConfirmTitle),
            parragraphs: [
              <>
                {t(
                  action === 'ignore'
                    ? I18Keys.ignoreConfirmMessage
                    : I18Keys.publishConfirmMessage,
                  { count: selectedPosts.length }
                )}
              </>,
            ],
            primaryButton: {
              label: t(I18Keys.confirm),
              onClick: confirmAction,
            },
            secondaryButton: {
              label: t(I18Keys.cancel),
              onClick: () => setShowConfirmModal(false),
            },
          }}
        />
      )}
    </>
  );
};
