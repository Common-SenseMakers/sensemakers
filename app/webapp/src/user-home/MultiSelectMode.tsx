import { Box, CheckBox } from 'grommet';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppModalStandard } from '../app/AppModalStandard';
import { I18Keys } from '../i18n/i18n';
import { PostCard } from '../post/PostCard';
import { usePostActions } from '../post/PostContext';
import { AppPostFull } from '../shared/types/types.posts';
import { AppButton } from '../ui-components';

interface MultiSelectModeProps {
  posts: AppPostFull[];
}

export const MultiSelectMode: React.FC<MultiSelectModeProps> = ({ posts }) => {
  const [selectedPosts, setSelectedPosts] = useState<AppPostFull[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [action, setAction] = useState<'ignore' | 'publish' | null>(null);
  const { t } = useTranslation();
  const { approveOrUpdate, ignore, isUpdating } = usePostActions();

  const handleSelect = (post: AppPostFull) => {
    setSelectedPosts((prev) =>
      prev.includes(post)
        ? prev.filter((p) => p.id !== post.id)
        : [...prev, post]
    );
  };

  const handleAction = (actionType: 'ignore' | 'publish') => {
    setAction(actionType);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (action === 'ignore') {
      await ignore(selectedPosts);
    } else if (action === 'publish') {
      await approveOrUpdate(selectedPosts);
    }
    setSelectedPosts([]);
    setShowConfirmModal(false);
  };

  return (
    <>
      <Box
        direction="row"
        justify="center"
        gap="medium"
        margin={{ bottom: 'medium' }}>
        <AppButton
          onClick={() => handleAction('ignore')}
          label={t(I18Keys.ignore)}
          disabled={selectedPosts.length === 0 || isUpdating}
        />
        <AppButton
          onClick={() => handleAction('publish')}
          label={t(I18Keys.publish)}
          disabled={selectedPosts.length === 0 || isUpdating}
        />
      </Box>
      {posts.map((post) => (
        <Box key={post.id} direction="row" align="center">
          <CheckBox
            checked={selectedPosts.some((p) => p.id === post.id)}
            onChange={() => handleSelect(post)}
          />
          <Box flex>
            <PostCard
              post={post}
              handleClick={() => {}} // Disable navigation in multi-select mode
            />
          </Box>
        </Box>
      ))}
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
              disabled: isUpdating,
            },
            secondaryButton: {
              label: t(I18Keys.cancel),
              onClick: () => setShowConfirmModal(false),
              disabled: isUpdating,
            },
          }}
        />
      )}
    </>
  );
};
