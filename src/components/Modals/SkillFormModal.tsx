'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MdClose, MdCode, MdCloudUpload, MdSwapHoriz } from 'react-icons/md'
import { toast } from 'sonner'
import Image from '@/components/Common/OptimizedImage'

type SkillFormModalProps = {
  isOpen: boolean
  mode: 'add' | 'edit'
  initialName?: string
  /** Existing icon URL (edit mode) */
  currentIcon?: string
  onClose: () => void
  onSubmit: (values: { name: string; file: File | null }) => void
}

const ALLOWED = /\.(jpg|jpeg|png|webp|gif)$/i
const MAX_MB = 5

const SkillFormModal = ({
  isOpen,
  mode,
  initialName = '',
  currentIcon = '',
  onClose,
  onSubmit,
}: SkillFormModalProps) => {
  const [name, setName] = useState(initialName)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset whenever the modal opens or a different skill is edited
  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setFile(null)
    }
  }, [isOpen, initialName, currentIcon])

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview(currentIcon)
  }, [file, currentIcon])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const accept = (picked: File | undefined) => {
    if (!picked) return
    if (!ALLOWED.test(picked.name)) {
      toast.error('Use a PNG, JPG, WEBP or GIF image (SVG is not supported)')
      return
    }
    if (picked.size > MAX_MB * 1024 * 1024) {
      toast.error(`Icon must be under ${MAX_MB}MB`)
      return
    }
    setFile(picked)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!file && !currentIcon) {
      toast.error('Please upload an icon')
      return
    }
    onSubmit({ name: name.trim(), file })
  }

  const isEdit = mode === 'edit'

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-form-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/50"
      >
        <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
            <MdCode className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="skill-form-title" className="text-[15px] font-semibold text-gray-100">
              {isEdit ? 'Edit skill' : 'New skill'}
            </h2>
            <p className="text-[12px] text-gray-500">
              {isEdit ? 'Change the name or replace the icon.' : 'Add a technology you work with.'}
            </p>
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5">
            {/* Icon + live preview */}
            <div className="flex items-center gap-4">
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => accept(e.target.files?.[0])}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragActive(false)
                  accept(e.dataTransfer.files?.[0])
                }}
                aria-label={preview ? 'Replace icon' : 'Upload icon'}
                className={`group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl transition-colors ${
                  preview
                    ? 'bg-white/5 ring-1 ring-line'
                    : dragActive
                      ? 'border border-dashed border-accent bg-accent/10'
                      : 'border border-dashed border-gray-600 hover:border-gray-500'
                }`}
              >
                {preview ? (
                  <>
                    <Image
                      src={preview}
                      alt="Skill icon"
                      width={64}
                      height={64}
                      className="h-16 w-16 object-contain"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <MdSwapHoriz className="h-6 w-6" />
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-gray-300">
                    <MdCloudUpload className="h-6 w-6" />
                    <span className="text-[11px] font-medium">Icon</span>
                  </span>
                )}
              </button>

              <div className="min-w-0 text-[12px] text-gray-500">
                <p className="font-medium text-gray-300">Skill icon</p>
                <p className="mt-0.5">Click or drop an image. PNG, JPG, WEBP or GIF, up to {MAX_MB}MB.</p>
                {file && <p className="mt-1 truncate text-gray-400">{file.name}</p>}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="skill-name" className="mb-1.5 block text-[12px] font-medium text-gray-400">
                Skill name <span className="text-rose-400">*</span>
              </label>
              <input
                id="skill-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. JavaScript"
                required
                autoFocus
                className="h-9 w-full rounded-lg border border-line bg-surface-0 px-3 text-[13px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60"
              />
            </div>

            {/* Live preview */}
            <div>
              <span className="mb-1.5 block text-[12px] font-medium text-gray-400">Preview</span>
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-line bg-surface-0 py-2 pl-2.5 pr-4">
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                  {preview ? (
                    <Image src={preview} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                  ) : (
                    <MdCode className="h-4 w-4 text-gray-600" />
                  )}
                </span>
                <span className="text-[13px] font-medium text-gray-200">{name.trim() || 'Skill name'}</span>
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-0/50 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-line px-4 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 rounded-lg bg-violet-600 px-5 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"
            >
              {isEdit ? 'Save changes' : 'Add skill'}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  )
}

export default SkillFormModal
