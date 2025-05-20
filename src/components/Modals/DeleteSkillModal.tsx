import { Skill } from "../Types/skill.type"
import { motion, AnimatePresence } from "framer-motion"

export const DeleteSkillModal = ({
  isOpen,
  onClose,
  onDelete,
  skill,
}: {
  isOpen: boolean
  onClose: () => void
  onDelete: (skillId: string) => void
  skill: Skill | null
}) => {
  return (
    <AnimatePresence>
      {isOpen && skill && (
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
            className="bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-100">Delete Skill</h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{skill.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <motion.button
                type="button"
                className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (skill.id) onDelete(skill.id)
                  onClose()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}