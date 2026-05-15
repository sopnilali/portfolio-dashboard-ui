'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  MdDescription,
  MdEditNote,
  MdEmail,
  MdOpenInNew,
  MdPerson,
  MdWorkOutline,
} from 'react-icons/md'
import { useAppSelector } from '@/components/Redux/hooks'
import {
  useAddAboutMutation,
  useGetAllAboutQuery,
  useUpdateAboutMutation,
  useUploadAboutImageMutation,
} from '@/components/Redux/features/about/aboutApi'
import {
  buildAboutFormData,
  normalizeAboutPayload,
  parseAboutRecord,
  type AboutFormPayload,
  type AboutItem,
} from '@/components/Types/about.type'
import AboutFormModal from '@/components/Modals/AboutFormModal'
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage'
import { toast } from 'sonner'

type AuthUser = {
  id?: string
  name?: string
  email?: string
  role?: string
} | null

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
}

const emptyForm: AboutFormPayload = {
  nameTitle: '',
  professonName: '',
  shortdescription: '',
  imageUrl: '',
  resumeUrl: '',
  cvUrl: '',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ProfileDashboard() {
  const user = useAppSelector((state) => state.auth.user) as AuthUser
  const { data, isLoading, isError, refetch, isFetching } = useGetAllAboutQuery(undefined)

  const about = useMemo(() => {
    const payload = data?.data !== undefined ? data.data : data
    const raw = normalizeAboutPayload(payload)
    const items = raw.map(parseAboutRecord).filter((x): x is AboutItem => x !== null)
    return items[0] ?? null
  }, [data])

  const [addAbout] = useAddAboutMutation()
  const [updateAbout] = useUpdateAboutMutation()
  const [uploadAboutImage] = useUploadAboutImageMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [formData, setFormData] = useState<AboutFormPayload>(emptyForm)

  const handleAboutImageUpload = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    const response = await uploadAboutImage(fd).unwrap()
    const raw = response as { data?: { file?: { url?: string } } }
    const url = raw?.data?.file?.url
    if (typeof url === 'string' && url.trim()) return url.trim()
    throw new Error('Invalid upload response')
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setIsUpdateMode(false)
    setSelectedId('')
  }

  const openEditProfileModal = () => {
    if (about) {
      setSelectedId(about.id)
      setFormData({
        nameTitle: about.nameTitle ?? '',
        professonName: about.professonName ?? '',
        shortdescription: about.shortdescription ?? '',
        imageUrl: about.imageUrl ?? '',
        resumeUrl: about.resumeUrl ?? '',
        cvUrl: about.cvUrl ?? '',
      })
      setIsUpdateMode(true)
    } else {
      resetForm()
    }
    setFormOpen(true)
  }

  const handleModalClose = () => {
    setFormOpen(false)
    resetForm()
  }

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nameTitle.trim() || !formData.shortdescription.trim()) {
      toast.error('Name and short description are required')
      return
    }

    let toastId: string | number | undefined
    const multipart = buildAboutFormData(formData)

    try {
      if (isUpdateMode && selectedId) {
        toastId = toast.loading('Updating…')
        await updateAbout({ id: selectedId, formData: multipart }).unwrap()
        toast.success('Profile updated', { id: toastId })
      } else {
        toastId = toast.loading('Saving…')
        await addAbout(multipart).unwrap()
        toast.success('Profile saved', { id: toastId })
      }

      setFormOpen(false)
      resetForm()
      refetch()
    } catch (error: unknown) {
      toast.error(
        getRtkQueryErrorMessage(error, isUpdateMode ? 'Update failed' : 'Save failed'),
        { id: toastId },
      )
    }
  }

  const updatedLabel = about?.updatedAt
    ? new Date(about.updatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  const showSkeleton = isLoading && !data

  return (
    <>
    <div className="relative max-w-6xl mx-auto pb-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-cyan-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80 mb-1">Profile</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Your Profile</h1>
        </div>
        <motion.button
          type="button"
          disabled={showSkeleton || isFetching}
          onClick={openEditProfileModal}
          whileHover={{ scale: showSkeleton || isFetching ? 1 : 1.02 }}
          whileTap={{ scale: showSkeleton || isFetching ? 1 : 0.98 }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600/90 hover:bg-violet-500 disabled:opacity-60 disabled:pointer-events-none text-white px-4 py-2.5 text-sm font-medium shadow-lg shadow-violet-900/40 transition-colors"
        >
          <MdEditNote className="w-5 h-5" />
          Edit profile
        </motion.button>
      </motion.header>

      {isError && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          Could not load <code className="text-rose-100/90">GET /about</code>.
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-3 underline text-rose-100 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <motion.section
          variants={item}
          className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 backdrop-blur-xl shadow-2xl shadow-black/40"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none" />
          <div className="relative p-6 sm:p-10">
            {showSkeleton ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-8 w-3/4 rounded-lg bg-gray-700/80" />
                <div className="h-5 w-1/2 rounded bg-gray-700/60" />
                <div className="h-24 w-full rounded-xl bg-gray-700/50" />
              </div>
            ) : about ? (
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="shrink-0 mx-auto md:mx-0">
                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden">
                    {about.imageUrl ? (
                      <Image
                        src={about.imageUrl}
                        alt={about.nameTitle}
                        fill
                        className="object-cover"
                        sizes="176px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-700 to-slate-800 flex items-center justify-center text-3xl font-bold text-white/90">
                        {initials(about.nameTitle)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{about.nameTitle}</h2>
                  <p className="mt-2 inline-flex items-center justify-center md:justify-start gap-2 text-violet-300/95 text-sm font-medium">
                    <MdWorkOutline className="w-4 h-4" />
                    {about.professonName || '—'}
                  </p>
                  <p className="mt-5 text-gray-300 leading-relaxed text-[15px]">{about.shortdescription}</p>

                  <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {about.resumeUrl ? (
                      <motion.a
                        href={about.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/35"
                      >
                        Resume
                        <MdOpenInNew className="w-4 h-4" />
                      </motion.a>
                    ) : null}
                    {about.cvUrl ? (
                      <motion.a
                        href={about.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        CV / portfolio
                        <MdOpenInNew className="w-4 h-4" />
                      </motion.a>
                    ) : null}
                    {!about.resumeUrl && !about.cvUrl ? (
                      <span className="text-xs text-gray-500">No resume or CV links yet.</span>
                    ) : null}
                  </div>

                  {updatedLabel ? (
                    <p className="mt-6 text-xs text-gray-500">
                      Profile data last updated{' '}
                      <span className="text-gray-400 tabular-nums">{updatedLabel}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <MdPerson className="w-14 h-14 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-300 font-medium">No public profile block found</p>
                <p className="text-sm text-gray-500 mt-2 mb-6 max-w-md mx-auto">
                  Tap <strong className="text-gray-300">Create profile</strong> to add your name, photo, bio, and links — same data as{' '}
                  <code className="text-gray-400">GET /about</code> / <code className="text-gray-400">PATCH /about/:id</code>.
                </p>
                <motion.button
                  type="button"
                  onClick={openEditProfileModal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/35"
                >
                  <MdEditNote className="w-5 h-5" />
                  Create profile
                </motion.button>
              </div>
            )}
            {isFetching && !showSkeleton ? (
              <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-violet-400 animate-pulse" title="Refreshing" />
            ) : null}
          </div>
        </motion.section>

        <motion.div variants={item} className="lg:col-span-5 flex flex-col gap-6">
          <section className="rounded-3xl border border-white/10 bg-gray-900/50 backdrop-blur-md p-6 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              <MdDescription className="w-4 h-4 text-violet-400" />
              My Account
            </div>
            <ul className="space-y-0 divide-y divide-gray-800/80 rounded-2xl overflow-hidden border border-gray-800/80">
              <li className="flex items-start justify-between gap-3 px-4 py-3.5 bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                <span className="text-xs text-gray-500 shrink-0 uppercase tracking-wide">Name</span>
                <span className="text-sm text-gray-100 text-right break-all">{user?.name?.trim() || '—'}</span>
              </li>
              <li className="flex items-start justify-between gap-3 px-4 py-3.5 bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                <span className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0 uppercase tracking-wide">
                  <MdEmail className="w-3.5 h-3.5" />
                  Email
                </span>
                <span className="text-sm text-gray-100 text-right break-all">{user?.email?.trim() || '—'}</span>
              </li>
              <li className="flex items-start justify-between gap-3 px-4 py-3.5 bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                <span className="text-xs text-gray-500 shrink-0 uppercase tracking-wide">Role</span>
                <span className="inline-flex items-center rounded-full bg-violet-950/80 px-2.5 py-0.5 text-xs font-medium text-violet-200 ring-1 ring-violet-500/30">
                  {user?.role || '—'}
                </span>
              </li>
              <li className="flex items-start justify-between gap-3 px-4 py-3.5 bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                <span className="text-xs text-gray-500 shrink-0 uppercase tracking-wide">User ID</span>
                <span className="text-xs font-mono text-gray-400 text-right break-all">{user?.id || '—'}</span>
              </li>
            </ul>
          </section>
        </motion.div>
      </motion.div>
    </div>

      <AboutFormModal
        isOpen={formOpen}
        isUpdateMode={isUpdateMode}
        formData={formData}
        onClose={handleModalClose}
        onSubmit={handleAboutSubmit}
        onChange={(partial) => setFormData((prev) => ({ ...prev, ...partial }))}
        onImageUpload={handleAboutImageUpload}
      />
    </>
  )
}
