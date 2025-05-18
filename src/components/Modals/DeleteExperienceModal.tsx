import React from 'react'
import { motion } from 'framer-motion';


export const DeleteExperienceModal = ({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}) => {
  if (!isOpen) return null

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Experience</h2>
        <p className="text-gray-700 mb-6">Are you sure you want to delete this experience? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={onDelete}
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DeleteExperienceModal 