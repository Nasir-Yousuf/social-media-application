import React from 'react';
import Modal from '../common/Modal';
import PostComposer from '../posts/PostComposer';
import { useNotifications } from '../../context/NotificationContext';

export const ShareAchievementModal = ({
  isOpen = false,
  onClose,
  initialContent = '',
  initialCode = '',
  initialLanguage = 'javascript',
}) => {
  const { showToast } = useNotifications();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Achievement to Feed">
      <div className="space-y-3 font-sans">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Share your programming typing milestone with the Clearfeed developer community!
        </p>
        <PostComposer
          initialContent={initialContent}
          initialShowCode={Boolean(initialCode)}
          initialLanguage={initialLanguage}
          compact={true}
          onPostCreated={() => {
            showToast('Achievement post published to feed!', 'success');
            onClose();
            window.dispatchEvent(new CustomEvent('clearfeed:newPost'));
          }}
        />
      </div>
    </Modal>
  );
};

export default ShareAchievementModal;
