'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdClose, MdContentCopy, MdDelete, MdReply } from 'react-icons/md'
import { toast } from 'sonner'

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
}

type ContactDetailModalProps = {
  contact: ContactMessage | null
  onClose: () => void
  onDelete: (contact: ContactMessage) => void
}

const ContactDetailModal = ({ contact, onClose, onDelete }: ContactDetailModalProps) => {
  useEffect(() => {
    if (!contact) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [contact, onClose])

  if (!contact) return null

  const received = new Date(contact.createdAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      toast.success('Email copied')
    } catch {
      toast.error('Could not copy email')
    }
  }

  const subject = encodeURIComponent(`Re: your message`)

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-detail-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/50"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-[15px] font-semibold text-sky-300 ring-1 ring-sky-500/20">
            {(contact.name.trim()[0] || '?').toUpperCase()}
          </span>
          <div className="min-w-0">
            <h2 id="contact-detail-title" className="truncate text-[15px] font-semibold text-gray-100">
              {contact.name}
            </h2>
            <p className="truncate text-[12px] text-gray-500">{contact.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-gray-600">Received {received}</p>
          <p className="whitespace-pre-wrap wrap-break-word text-[14px] leading-relaxed text-gray-200">
            {contact.message}
          </p>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line bg-surface-0/50 px-5 py-3">
          <button
            type="button"
            onClick={() => onDelete(contact)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
          >
            <MdDelete className="h-4 w-4" /> Delete
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={copyEmail}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
            >
              <MdContentCopy className="h-4 w-4" /> Copy email
            </button>
            <a
              href={`mailto:${contact.email}?subject=${subject}`}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"
            >
              <MdReply className="h-4 w-4" /> Reply
            </a>
          </div>
        </footer>
      </motion.div>
    </div>
  )
}

export default ContactDetailModal
