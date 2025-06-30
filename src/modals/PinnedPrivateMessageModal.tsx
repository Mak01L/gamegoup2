import React, { useState } from 'react';
import PrivateMessageModal from './PrivateMessageModal';

interface PinnedPrivateMessageModalProps {
  conversationId: string;
  otherUser: { id: string; username: string; avatar_url?: string };
  onClose: () => void;
}

const PinnedPrivateMessageModal: React.FC<PinnedPrivateMessageModalProps> = ({ conversationId, otherUser, onClose }) => {
  // Simple wrapper to always show PrivateMessageModal as a modal
  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <PrivateMessageModal
        conversationId={conversationId}
        otherUser={otherUser}
        onClose={onClose}
      />
    </div>
  );
};

export default PinnedPrivateMessageModal;
