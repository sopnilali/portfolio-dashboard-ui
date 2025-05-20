"use client"

import { AddToSkillModal } from '@/components/Modals/AddToSkillModal'
import { DeleteSkillModal } from '@/components/Modals/DeleteSkillModal'
import { EditSkillModal } from '@/components/Modals/EditSkillModal'
import { useAddSkillMutation, useDeleteSkillMutation, useGetAllSkillsQuery, useUpdateSkillMutation } from '@/components/Redux/features/skill/skillApi'
import { Skill } from '@/components/Types/skill.type'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import { MdDelete, MdEdit } from 'react-icons/md'

const modalMotionProps = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
  className: "fixed inset-0 z-50 flex items-center justify-center"
}

// Animation variants for table rows
const tableRowVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (index: number) => ({ 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      delay: index * 0.05,
      duration: 0.3,
      ease: "easeOut"
    } 
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
}

// Table container animation
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0.1
    } 
  }
}

const ManageSkill = () => {
  const { data: skilldata, isLoading, refetch } = useGetAllSkillsQuery(undefined)
  const [skills, setSkills] = useState<Skill[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editSkill, setEditSkill] = useState<Skill| null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteSkill, setDeleteSkill] = useState<Skill | null>(null)
  const [addSkill] = useAddSkillMutation()
  const [updateSkill] = useUpdateSkillMutation()

  // Update skills when API data changes
  React.useEffect(() => {
    if (skilldata?.data) {
      setSkills(skilldata.data)
    }
  }, [skilldata])

  const handleAddSkill = async (formData: FormData) => {

    const toastId = toast.loading('Adding skill...')

    try {
      const result = await addSkill(formData).unwrap()
      toast.success(result.message, { id: toastId })
    } catch (error) {
      toast.error('Failed to add skill', { id: toastId }  )
    }
  }

  const handleEditSkill = async (formData: { id: string, data: FormData }) => {
    const toastId = toast.loading('Updating skill...')
    try {
      const result = await updateSkill(formData).unwrap()
      toast.success(result.message, { id: toastId })
    } catch (error) {
      toast.error('Failed to update skill', { id: toastId })
    }
  }

  const [deleteSkillMutation] = useDeleteSkillMutation();

  const handleDeleteSkill = async (skillId: string) => {
    const toastId = toast.loading('Deleting skill...')
    try {
      const result = await deleteSkillMutation(skillId).unwrap()
      toast.success(result.message, { id: toastId })
    } catch (error) {
      toast.error('Failed to delete skill', { id: toastId })
    }
  }

  return (
    <motion.div
      className="max-w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Manage Skills</h1>
        <motion.button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-700/90 text-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700/80"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          + Add Skill
        </motion.button>
      </div>

      <div className="overflow-x-auto rounded" style={{ overflowY: 'hidden' }}>
        <motion.table
          className="min-w-full bg-gray-900 rounded-lg shadow-lg"
          initial="hidden"
          animate="visible"
          variants={tableContainerVariants}
        >
          <thead className="bg-slate-700/90 text-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Icon</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-100 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={3}>
                    <div className="flex justify-center items-center py-6 text-gray-400">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <motion.tr
                    key={skill.id || idx}
                    className="hover:bg-gray-700 duration-500 transition-all"
                    variants={tableRowVariants}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                  >
                    <td className="px-6 py-4 whitespace-nowrap tracking-wider">
                      <motion.div 
                        className="w-12 h-12 relative flex items-center"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          className="object-contain w-10 h-10 rounded"
                        />
                      </motion.div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 tracking-wider">
                      {skill.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 tracking-wider">
                      <motion.button
                        className="mr-2 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        title="Edit"
                        onClick={() => {
                          setEditSkill(skill)
                          setEditModalOpen(true)
                        }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdEdit className='w-5 h-5' />
                      </motion.button>
                      <motion.button
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Delete"
                        onClick={() => {
                          setDeleteSkill(skill)
                          setDeleteModalOpen(true)
                        }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdDelete className='w-5 h-5' />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <div className="flex justify-center items-center py-12">
                      <span className="text-gray-400 text-lg font-semibold">
                        Not found. Please add your skills to showcase your expertise.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </motion.table>
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div {...modalMotionProps}>
            <AddToSkillModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddSkill}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editModalOpen && (
          <motion.div {...modalMotionProps}>
            <EditSkillModal
              isOpen={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              skill={editSkill}
              onEdit={handleEditSkill}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div {...modalMotionProps}>
            <DeleteSkillModal
              isOpen={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              onDelete={handleDeleteSkill}
              skill={deleteSkill}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ManageSkill
