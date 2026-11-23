'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MdClose, MdWorkOutline } from 'react-icons/md'
import { toast } from 'sonner'
import type { Experience } from '../Types/experience.type'

type ExperienceFormModalProps = {
  isOpen: boolean
  mode: 'add' | 'edit'
  initial?: Experience
  onClose: () => void
  onSubmit: (data: Experience) => void
}

const DESCRIPTION_MAX = 500

const label = 'mb-1.5 block text-[12px] font-medium text-gray-400'
const field =
  'h-9 w-full rounded-lg border border-line bg-surface-0 px-3 text-[13px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-40'

const toDateInput = (iso: string | null | undefined) => {
  if (iso == null || iso === '' || iso === 'null' || iso === 'undefined') return ''
  return String(iso).split('T')[0]
}

const toISO = (date: string) => (date.includes('T') ? date : new Date(`${date}T00:00:00.000Z`).toISOString())

const ExperienceFormModal = ({ isOpen, mode, initial, onClose, onSubmit }: ExperienceFormModalProps) => {
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [current, setCurrent] = useState(false)
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setCompany(initial?.company ?? '')
    setPosition(initial?.position ?? '')
    setStartDate(toDateInput(initial?.startDate))
    const end = toDateInput(initial?.endDate)
    setEndDate(end)
    // New entries default to a past role; an existing entry with no end date is current
    setCurrent(mode === 'edit' && !end)
    setDescription(initial?.description ?? '')
  }, [isOpen, mode, initial])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isEdit = mode === 'edit'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !position.trim() || !startDate || !description.trim()) return
    if (!current && endDate && endDate < startDate) {
      toast.error('End date cannot be before the start date')
      return
    }

    onSubmit({
      id: initial?.id,
      company: company.trim(),
      position: position.trim(),
      startDate: toISO(startDate),
      endDate: !current && endDate ? toISO(endDate) : null,
      description: description.trim(),
    })
    onClose()
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="experience-form-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/50"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
            <MdWorkOutline className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="experience-form-title" className="text-[15px] font-semibold text-gray-100">
              {isEdit ? 'Edit experience' : 'New experience'}
            </h2>
            <p className="text-[12px] text-gray-500">
              {isEdit ? 'Update this role.' : 'Add a role to your work history.'}
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="exp-company" className={label}>
                  Company <span className="text-rose-400">*</span>
                </label>
                <input
                  id="exp-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Greenbyte Software"
                  required
                  autoFocus
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="exp-position" className={label}>
                  Position <span className="text-rose-400">*</span>
                </label>
                <input
                  id="exp-position"
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Software Engineer"
                  required
                  className={field}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="exp-start" className={label}>
                  Start date <span className="text-rose-400">*</span>
                </label>
                <input
                  id="exp-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="exp-end" className={label}>
                  End date
                </label>
                <input
                  id="exp-end"
                  type="date"
                  value={current ? '' : endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={current}
                  className={field}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-gray-300">
              <button
                type="button"
                role="switch"
                aria-checked={current}
                onClick={() => setCurrent((v) => !v)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  current ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    current ? 'translate-x-4' : ''
                  }`}
                />
              </button>
              <span onClick={() => setCurrent((v) => !v)}>I currently work here</span>
            </label>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="exp-desc" className="text-[12px] font-medium text-gray-400">
                  Description <span className="text-rose-400">*</span>
                </label>
                <span
                  className={`text-[11px] tabular-nums ${description.length > DESCRIPTION_MAX ? 'text-amber-400' : 'text-gray-600'}`}
                >
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                id="exp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you do and achieve in this role?"
                rows={4}
                required
                className="w-full resize-none rounded-lg border border-line bg-surface-0 px-3 py-2 text-[13px] leading-relaxed text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60"
              />
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-surface-0/50 px-5 py-3">
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
              {isEdit ? 'Save changes' : 'Add experience'}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  )
}

export default ExperienceFormModal
