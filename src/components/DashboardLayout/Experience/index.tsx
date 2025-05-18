"use client"

import { AddtoExperienceModal } from '@/components/Modals/AddtoExperienceModal'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Import the ExperienceInput type from the AddtoExperienceModal
import type { Experience } from '@/components/Types/experience.type'
import { useAddExperienceMutation, useDeleteExperienceMutation, useGetAllExperiencesQuery, useUpdateExperienceMutation } from '@/components/Redux/features/experience/experienceApi'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import DeleteExperienceModal from '@/components/Modals/DeleteExperienceModal'
import { toast } from 'sonner'
import { Delete, TrashIcon } from 'lucide-react'
import { MdDelete, MdEdit } from 'react-icons/md'
import EditExperienceModal from '@/components/Modals/EditExperienceModal'

const tableVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            staggerChildren: 0.05, 
            delayChildren: 0.1,
            duration: 0.4 
        } 
    }
}

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

const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.15, rotate: 5, transition: { type: "spring", stiffness: 400 } },
    tap: { scale: 0.95 }
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

const ManageExperience = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [selectedExperienceId, setSelectedExperienceId] = React.useState('')
    const [selectedExperience, setSelectedExperience] = React.useState<Experience | undefined>(undefined)

    const { data: experiences, isLoading, isError } = useGetAllExperiencesQuery(undefined)
    const [addExperience, { isLoading: isAdding }] = useAddExperienceMutation()
    const [deleteExperience, { isLoading: isDeleting }] = useDeleteExperienceMutation()
    const [updateExperience, { isLoading: isUpdating }] = useUpdateExperienceMutation()

    const handleAddExperience = async (data: Experience) => {
        const toastId = toast.loading('Adding experience...')
        try {
            const res = await addExperience(data).unwrap()
            if (res.success) {
                toast.success(res.message, { id: toastId })
            } else {
                toast.error(res.message, { id: toastId })
            }
        } catch (error) {
            toast.error('Failed to add experience', { id: toastId })
        }
    }

    const handleDeleteExperience = async() => {
        const toastId = toast.loading('Deleting experience...')
        try {
            const res = await deleteExperience(selectedExperienceId).unwrap()
            if (res.success) {
                setIsDeleteModalOpen(false)
                toast.success(res.message, { id: toastId })
            } else {
                toast.error(res.message, { id: toastId })
            }
        } catch (error) {
            toast.error('Failed to delete experience', { id: toastId })
        }
    }

    const handleEditExperience = async (data: Experience) => {
        const toastId = toast.loading('Updating experience...')
        try {
            const res = await updateExperience({ id: data.id, data: data }).unwrap()
            if (res.success) {
                setIsEditModalOpen(false)
                toast.success(res.message, { id: toastId })
            } else {
                toast.error(res.message, { id: toastId })
            }
        } catch (error) {
            toast.error('Failed to update experience', { id: toastId })
        }
    }

    return (
        <motion.div
            className="max-w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <motion.div
                className="flex justify-between items-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <h1 className="text-2xl font-bold">Manage Experience</h1>
                <motion.button
                    type="button"
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsModalOpen(true)}
                >
                    + Add Experience
                </motion.button>
            </motion.div>

            <div className="overflow-x-auto rounded" style={{ overflowY: 'hidden' }}>
                <motion.table
                    className="min-w-full bg-gray-800 rounded-lg shadow-lg"
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <thead className="bg-gray-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Company</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Position</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-300 divide-y divide-gray-600">
                        <AnimatePresence>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="flex justify-center items-center py-4 text-gray-800">
                                        <LoadingSpinner />
                                    </div>
                                </td>
                            </tr>
                        ) : experiences?.data && experiences.data.length > 0 ? (
                            experiences.data.map((exp: Experience, idx: number) => (
                                <motion.tr
                                    key={exp.company + exp.position + idx}
                                    className="hover:bg-gray-100 duration-500 transition-all"
                                    variants={tableRowVariants}
                                    custom={idx}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    layout
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tracking-wider">
                                        {exp.company}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tracking-wider">
                                        {exp.position}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 max-w-xs">
                                        {exp.description.slice(0, 40)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {formatDate(exp.startDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {formatDate(exp.endDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 flex gap-3">
                                        <motion.button
                                            type="button"
                                            className="flex items-center justify-center"
                                            variants={buttonVariants}
                                            initial="initial"
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => {
                                                setSelectedExperience(exp)
                                                setIsEditModalOpen(true)
                                            }}
                                        >
                                            <MdEdit className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            className="flex items-center justify-center"
                                            variants={buttonVariants}
                                            initial="initial"
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => {
                                                setSelectedExperienceId(exp.id as string)
                                                setIsDeleteModalOpen(true)
                                            }}
                                        >
                                            <MdDelete className="w-5 h-5 text-red-500 hover:text-red-600 cursor-pointer" />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6}>
                                    <div className="flex justify-center items-center py-12">
                                        <span className="text-gray-500 text-lg font-semibold">
                                            No experience found. Please add your work experience to showcase your professional journey.
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
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ zIndex: 50, position: 'fixed', inset: 0 }}
                    >
                        <AddtoExperienceModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onAdd={handleAddExperience}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ zIndex: 50, position: 'fixed', inset: 0 }}
                    >
                        <DeleteExperienceModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onDelete={handleDeleteExperience}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ zIndex: 50, position: 'fixed', inset: 0 }}
                    >
                        <EditExperienceModal
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            onEdit={handleEditExperience}
                            experienceData={selectedExperience}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ManageExperience
