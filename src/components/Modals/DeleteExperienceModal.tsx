import React from 'react'
import ConfirmDialog from './ConfirmDialog'

export const DeleteExperienceModal = ({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    title="Delete experience?"
    description="This work experience will be permanently removed. This action cannot be undone."
    onConfirm={onDelete}
    onClose={onClose}
  />
)

export default DeleteExperienceModal
