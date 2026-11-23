import ConfirmDialog from './ConfirmDialog';

interface DeleteMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  menuId: string;
}

const DeleteMenuModal = ({ isOpen, onClose, onDelete, menuId }: DeleteMenuModalProps) => (
  <ConfirmDialog
    isOpen={isOpen}
    title="Delete menu item?"
    description="This link will be removed from your site navigation. This action cannot be undone."
    onConfirm={() => onDelete(menuId)}
    onClose={onClose}
  />
);

export default DeleteMenuModal;
