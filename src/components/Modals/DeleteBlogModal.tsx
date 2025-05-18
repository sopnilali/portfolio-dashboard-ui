import { motion } from 'framer-motion';
import { MdDelete } from 'react-icons/md';

interface DeleteBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  blogId: string;
}

const DeleteBlogModal = ({ isOpen, onClose, onDelete, blogId }: DeleteBlogModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0  bg-black/40 flex items-center justify-center z-50 "
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this blog post? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onDelete(blogId)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <MdDelete className="w-5 h-5" />
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteBlogModal; 