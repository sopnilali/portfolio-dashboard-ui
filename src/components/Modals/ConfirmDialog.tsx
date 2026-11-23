'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MdDelete, MdWarningAmber } from 'react-icons/md'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

/** Premium destructive-action confirmation, shared by the delete modals. */
const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/50"
      >
        <div className="flex gap-4 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
            <MdWarningAmber className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-[15px] font-semibold text-gray-100">
              {title}
            </h2>
            <p id="confirm-desc" className="mt-1 text-[13px] leading-relaxed text-gray-400">
              {description}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-surface-0/50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="h-9 rounded-lg border border-line px-4 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-rose-600 px-4 text-[13px] font-medium text-white transition-colors hover:bg-rose-500"
          >
            <MdDelete className="h-4 w-4" />
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ConfirmDialog
