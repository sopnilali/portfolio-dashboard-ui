import React from 'react';
import ConfirmDialog from './ConfirmDialog';

interface DeleteContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  contactId?: string;
}

const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  contactId = '',
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    title="Delete this message?"
    description="The message will be permanently removed. This action cannot be undone."
    onConfirm={() => onDelete(contactId)}
    onClose={onClose}
  />
);

export default DeleteContactModal;
