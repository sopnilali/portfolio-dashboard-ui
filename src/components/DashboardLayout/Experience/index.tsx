"use client"

import { AddtoExperienceModal } from '@/components/Modals/AddtoExperienceModal'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Experience } from '@/components/Types/experience.type'
import { useAddExperienceMutation, useDeleteExperienceMutation, useGetAllExperiencesQuery, useUpdateExperienceMutation } from '@/components/Redux/features/experience/experienceApi'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import DeleteExperienceModal from '@/components/Modals/DeleteExperienceModal'
import { toast } from 'sonner'
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage'
import { MdAdd, MdDelete, MdEdit, MdWorkOutline } from 'react-icons/md'
import EditExperienceModal from '@/components/Modals/EditExperienceModal'

const COLS = 4

const isPresent = (dateStr: string | null | undefined) =>
    dateStr == null || dateStr === '' || dateStr === 'null' || dateStr === 'undefined' || Number.isNaN(new Date(dateStr).getTime())

const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

/** "2 yrs 3 mos" between start and end (or today). */
const formatDuration = (start: string, end: string | null | undefined) => {
    const s = new Date(start)
    if (Number.isNaN(s.getTime())) return ''
    const e = isPresent(end) ? new Date() : new Date(end as string)
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
    if (months < 1) months = 1
    const years = Math.floor(months / 12)
    const rest = months % 12
    const parts = []
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`)
    if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`)
    return parts.join(' ')
}

const ManageExperience = () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [selectedExperienceId, setSelectedExperienceId] = React.useState('')
    const [selectedExperience, setSelectedExperience] = React.useState<Experience | undefined>(undefined)

    const { data: experiences, isLoading } = useGetAllExperiencesQuery(undefined)
    const [addExperience] = useAddExperienceMutation()
    const [deleteExperience] = useDeleteExperienceMutation()
    const [updateExperience] = useUpdateExperienceMutation()

    const list: Experience[] = React.useMemo(() => {
        const rows: Experience[] = Array.isArray(experiences?.data) ? [...experiences.data] : []
        // Current roles first, then newest start date
        return rows.sort((a, b) => {
            const ap = isPresent(a.endDate) ? 1 : 0
            const bp = isPresent(b.endDate) ? 1 : 0
            if (ap !== bp) return bp - ap
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        })
    }, [experiences])

    const handleAddExperience = async (data: Experience) => {
        const toastId = toast.loading('Adding experience...')
        try {
            const res = await addExperience(data).unwrap()
            if (res.success) {
                toast.success(res.message, { id: toastId })
            } else {
                toast.error(res.message, { id: toastId })
            }
        } catch (error: unknown) {
            toast.error(getRtkQueryErrorMessage(error, 'Failed to add experience'), { id: toastId })
        }
    }

    const handleDeleteExperience = async () => {
        const toastId = toast.loading('Deleting experience...')
        try {
            const res = await deleteExperience(selectedExperienceId).unwrap()
            if (res.success) {
                setIsDeleteModalOpen(false)
                toast.success(res.message, { id: toastId })
            } else {
                toast.error(res.message, { id: toastId })
            }
        } catch (error: unknown) {
            toast.error(getRtkQueryErrorMessage(error, 'Failed to delete experience'), { id: toastId })
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
        } catch (error: unknown) {
            toast.error(getRtkQueryErrorMessage(error, 'Failed to update experience'), { id: toastId })
        }
    }

    return (
        <motion.div
            className="mx-auto space-y-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-gray-100">Experience</h1>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] tabular-nums text-gray-400 ring-1 ring-line">
                        {list.length}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="ml-auto flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"
                >
                    <MdAdd className="h-4 w-4" /> Add experience
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl">
                <table className="min-w-170 table-fixed">
                    <colgroup>
                        <col className="w-64" />
                        <col className="w-52" />
                        <col />
                        <col className="w-20" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="text-left">Role</th>
                            <th className="text-left">Period</th>
                            <th className="text-left">Description</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence initial={false}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={COLS}>
                                        <div className="flex items-center justify-center py-10 text-gray-400">
                                            <LoadingSpinner />
                                        </div>
                                    </td>
                                </tr>
                            ) : list.length > 0 ? (
                                list.map((exp, idx) => {
                                    const present = isPresent(exp.endDate)
                                    return (
                                        <motion.tr
                                            key={exp.id ?? `${exp.company}-${exp.position}-${idx}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <td>
                                                <div className="flex items-center gap-3 py-0.5">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-[13px] font-semibold text-amber-300 ring-1 ring-amber-500/20">
                                                        {(exp.company?.trim()[0] || '?').toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-medium text-gray-100" title={exp.position}>
                                                            {exp.position}
                                                        </p>
                                                        <p className="truncate text-[12px] text-gray-500" title={exp.company}>
                                                            {exp.company}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap">
                                                <p className="flex items-center gap-1.5 text-[12px] tabular-nums text-gray-300">
                                                    {formatMonth(exp.startDate)}
                                                    <span className="text-gray-600">→</span>
                                                    {present ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                            Present
                                                        </span>
                                                    ) : (
                                                        formatMonth(exp.endDate as string)
                                                    )}
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-gray-600">
                                                    {formatDuration(exp.startDate, exp.endDate)}
                                                </p>
                                            </td>

                                            <td>
                                                <p className="line-clamp-2 text-[12px] leading-relaxed text-gray-400" title={exp.description}>
                                                    {exp.description}
                                                </p>
                                            </td>

                                            <td>
                                                <div className="flex justify-end gap-0.5">
                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        aria-label={`Edit ${exp.position}`}
                                                        onClick={() => {
                                                            setSelectedExperience(exp)
                                                            setIsEditModalOpen(true)
                                                        }}
                                                        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-indigo-300"
                                                    >
                                                        <MdEdit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        aria-label={`Delete ${exp.position}`}
                                                        onClick={() => {
                                                            setSelectedExperienceId(exp.id as string)
                                                            setIsDeleteModalOpen(true)
                                                        }}
                                                        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-rose-300"
                                                    >
                                                        <MdDelete className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={COLS}>
                                        <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                                            <MdWorkOutline className="h-7 w-7 text-gray-600" />
                                            <p className="text-[13px] font-medium text-gray-300">No experience yet</p>
                                            <p className="text-[12px] text-gray-500">Add your work history to show your professional journey.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <AddtoExperienceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddExperience}
            />

            <DeleteExperienceModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDeleteExperience}
            />

            <EditExperienceModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onEdit={handleEditExperience}
                experienceData={selectedExperience}
            />
        </motion.div>
    )
}

export default ManageExperience
