"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import { useDeleteContactMutation, useGetAllContactsQuery } from '@/components/Redux/features/contact/contactApi'
import { MdDelete } from 'react-icons/md'
import DeleteContactModal from '@/components/Modals/DeleteContactModal'
import { toast } from 'sonner'

type Contact = {
    id: string
    name: string
    email: string
    message: string
    createdAt: string
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

// Framer Motion Variants for professional effect
const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
}

const headerVariants = {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] } }
}

const rowVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: 0.08 + i * 0.04,
            type: "spring",
            stiffness: 180,
            damping: 20
        }
    }),
    exit: { opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.18 } }
}

const ManageContact = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
    const { data: contacts, isLoading } = useGetAllContactsQuery(undefined)
    const [deleteContact] = useDeleteContactMutation()

    const handleDelete = async (id: string) => {
        const toastId = toast.loading('Deleting contact...')
        try {
            const res = await deleteContact(id)
            toast.success(res.data.message, { id: toastId })
        } catch (error) {
            toast.error('Error deleting contact', { id: toastId })
        }
        setIsDeleteModalOpen(false)
    }

    return (
        <motion.div
            className="max-w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div
                className="flex justify-between items-center mb-6"
                variants={headerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
            >
                <h1 className="text-2xl font-bold">Manage Contacts</h1>
            </motion.div>

            {/* Prevent vertical scrollbar on framer-motion animation */}
            <div className="overflow-x-auto rounded" style={{ overflowY: 'hidden' }}>
                <motion.table
                    className="min-w-full bg-gray-800 rounded-lg shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <thead className="bg-gray-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Message</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Posted Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-300 divide-y divide-gray-600">
                        <AnimatePresence>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="flex justify-center items-center py-4 text-gray-800">
                                            <LoadingSpinner />
                                        </div>
                                    </td>
                                </tr>
                            ) : contacts?.data && contacts.data.length > 0 ? (
                                contacts.data.map((contact: Contact, idx: number) => (
                                    <motion.tr
                                        key={contact.id}
                                        className="hover:bg-gray-100 duration-500 transition-all"
                                        variants={rowVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        custom={idx}
                                        layout
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tracking-wider">
                                            {contact.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tracking-wider">
                                            {contact.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 max-w-xs">
                                            {contact.message.length > 60
                                                ? contact.message.slice(0, 60) + '...'
                                                : contact.message}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {formatDate(contact.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            <motion.button
                                                className="text-red-600 hover:text-red-900 mr-4 cursor-pointer"
                                                whileHover={{ scale: 1.15, rotate: 5, boxShadow: "0 2px 8px rgba(220,38,38,0.12)" }}
                                                whileTap={{ scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <MdDelete className="w-5 h-5" />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td colSpan={5}>
                                        <div className="flex justify-center items-center py-8 text-gray-500 text-lg font-semibold">
                                            Not found
                                        </div>
                                    </td>
                                </motion.tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </motion.table>
            </div>
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", duration: 0.35 }}
                        style={{ zIndex: 50, position: 'fixed', inset: 0, overflowY: 'hidden' }}
                    >
                        <DeleteContactModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onDelete={() => selectedContact && handleDelete(selectedContact.id)}
                            contactId={selectedContact?.id}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ManageContact
