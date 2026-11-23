"use client"

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import { useDeleteContactMutation, useGetAllContactsQuery } from '@/components/Redux/features/contact/contactApi'
import { MdDelete, MdMailOutline, MdSearch, MdOpenInNew } from 'react-icons/md'
import DeleteContactModal from '@/components/Modals/DeleteContactModal'
import ContactDetailModal, { type ContactMessage } from '@/components/Modals/ContactDetailModal'
import { toast } from 'sonner'
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage'

const COLS = 4

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    if (Number.isNaN(diff)) return ''
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return ''
}

const ManageContact = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null)
    const [openContact, setOpenContact] = useState<ContactMessage | null>(null)
    const [search, setSearch] = useState('')
    const { data: contacts, isLoading } = useGetAllContactsQuery(undefined)
    const [deleteContact] = useDeleteContactMutation()

    const all: ContactMessage[] = useMemo(
        () => (Array.isArray(contacts?.data) ? contacts.data : []),
        [contacts]
    )

    const list = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return all
        return all.filter(
            (c) =>
                c.name?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.message?.toLowerCase().includes(q)
        )
    }, [all, search])

    const handleDelete = async (id: string) => {
        const toastId = toast.loading('Deleting contact...')
        try {
            const res = await deleteContact(id).unwrap()
            const r = res as { data?: { message?: string } | string }
            const msg =
                typeof r?.data === 'string'
                    ? r.data
                    : r?.data?.message ?? 'Contact deleted'
            toast.success(msg, { id: toastId })
        } catch (error: unknown) {
            toast.error(getRtkQueryErrorMessage(error, 'Error deleting contact'), { id: toastId })
        }
        setIsDeleteModalOpen(false)
    }

    const askDelete = (contact: ContactMessage) => {
        setSelectedContact(contact)
        setOpenContact(null)
        setIsDeleteModalOpen(true)
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
                    <h1 className="text-gray-100">Messages</h1>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] tabular-nums text-gray-400 ring-1 ring-line">
                        {all.length}
                    </span>
                </div>

                <div className="relative ml-auto">
                    <MdSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email or message…"
                        className="h-8 w-56 rounded-lg border border-line bg-surface-1 pl-8 pr-3 text-[13px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60 sm:w-72"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl">
                <table className="min-w-170 table-fixed">
                    <colgroup>
                        <col className="w-64" />
                        <col />
                        <col className="w-36" />
                        <col className="w-24" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="text-left">Sender</th>
                            <th className="text-left">Message</th>
                            <th className="text-left">Received</th>
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
                                list.map((contact) => (
                                    <motion.tr
                                        key={contact.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => setOpenContact(contact)}
                                        className="cursor-pointer"
                                    >
                                        <td>
                                            <div className="flex items-center gap-3 py-0.5">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-[12px] font-semibold text-sky-300 ring-1 ring-sky-500/20">
                                                    {(contact.name?.trim()[0] || '?').toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-medium text-gray-100" title={contact.name}>
                                                        {contact.name}
                                                    </p>
                                                    <p className="truncate text-[12px] text-gray-500" title={contact.email}>
                                                        {contact.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <p className="line-clamp-2 text-[12px] leading-relaxed text-gray-400">
                                                {contact.message}
                                            </p>
                                        </td>

                                        <td className="whitespace-nowrap">
                                            <p className="text-[12px] tabular-nums text-gray-300">{formatDate(contact.createdAt)}</p>
                                            <p className="text-[11px] text-gray-600">{timeAgo(contact.createdAt)}</p>
                                        </td>

                                        <td>
                                            <div className="flex justify-end gap-0.5">
                                                <button
                                                    type="button"
                                                    title="Read message"
                                                    aria-label={`Read message from ${contact.name}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setOpenContact(contact)
                                                    }}
                                                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-sky-300"
                                                >
                                                    <MdOpenInNew className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Delete"
                                                    aria-label={`Delete message from ${contact.name}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        askDelete(contact)
                                                    }}
                                                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-rose-300"
                                                >
                                                    <MdDelete className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={COLS}>
                                        <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                                            <MdMailOutline className="h-7 w-7 text-gray-600" />
                                            <p className="text-[13px] font-medium text-gray-300">
                                                {all.length === 0 ? 'No messages yet' : 'No messages match your search'}
                                            </p>
                                            <p className="text-[12px] text-gray-500">
                                                {all.length === 0
                                                    ? 'Messages sent from your contact form will appear here.'
                                                    : 'Try a different name, email or keyword.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <ContactDetailModal
                contact={openContact}
                onClose={() => setOpenContact(null)}
                onDelete={askDelete}
            />

            <DeleteContactModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={() => selectedContact && handleDelete(selectedContact.id)}
                contactId={selectedContact?.id}
            />
        </motion.div>
    )
}

export default ManageContact
