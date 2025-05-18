import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  contactId?: string;
}



const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, scale: 0.95, y: 40, transition: { duration: 0.18 } }
};

const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  contactId = '',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed  inset-0 z-50 flex justify-center items-center bg-black/40 duration-500 transition-all"

        >
          <motion.div
            className="text-black bg-white rounded-lg p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this contact? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => onDelete(contactId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteContactModal; 