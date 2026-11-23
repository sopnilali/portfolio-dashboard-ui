'use client'

import React, { useState } from 'react'
import Image from '@/components/Common/OptimizedImage'
import { useGetAllBlogsQuery, useAddBlogMutation, useEditorUploadMutation, useDeleteBlogMutation, useUpdateBlogMutation, useGetBlogQuery } from '@/components/Redux/features/blog/blogApi'
import { MdDelete, MdEdit, MdAdd, MdSearch, MdArticle } from 'react-icons/md'
import { toast } from 'sonner'
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage'
import DeleteBlogModal from '@/components/Modals/DeleteBlogModal'
import BlogFormModal from '@/components/Modals/BlogFormModal'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import type { BlogFormData, TBlog } from '@/components/Types/blog.type'
import { normalizeList, normalizeStringArray } from '@/components/Utils/normalizeArray'

const modalMotionProps = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
  className: "fixed inset-0 z-50 flex items-center justify-center"
}

const initialFormData: BlogFormData = {
  title: '',
  content: '',
  tags: [],
  status: 'Published',
  imageUrl: null,
}

const TABLE_COL_COUNT = 6
const MAX_VISIBLE_TAGS = 3

type StatusFilter = 'All' | 'Published' | 'Draft'
const STATUS_FILTERS: StatusFilter[] = ['All', 'Published', 'Draft']

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const StatusBadge = ({ status }: { status: string }) => {
  const published = status === 'Published'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
        published
          ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
          : 'bg-amber-500/10 text-amber-300 ring-amber-500/20'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      {status}
    </span>
  )
}

const renderTags = (tags: string[]) => {
  if (tags.length === 0) return <span className="text-gray-600">—</span>
  const visible = tags.slice(0, MAX_VISIBLE_TAGS)
  const remaining = tags.length - visible.length

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <span
          key={tag}
          className="max-w-28 truncate rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-gray-300 ring-1 ring-line"
        >
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="rounded-md px-1.5 py-0.5 text-[11px] text-gray-500">+{remaining}</span>
      )}
    </div>
  )
}

const ManageBlog = () => {
  const { data: blogs, isLoading, refetch } = useGetAllBlogsQuery(undefined)
  const [addBlog] = useAddBlogMutation()
  const [updateBlog] = useUpdateBlogMutation()
  const [editorUpload] = useEditorUploadMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [selectedBlogId, setSelectedBlogId] = useState<string>('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, blogId: '' })
  const [formData, setFormData] = useState<BlogFormData>(initialFormData)

  const [deleteBlog] = useDeleteBlogMutation()
  useGetBlogQuery(selectedBlogId, {
    skip: !selectedBlogId,
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  const allBlogs = normalizeList<TBlog>(blogs?.data)
  const blogInfo = allBlogs.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      b.title?.toLowerCase().includes(q) ||
      normalizeStringArray(b.tags).some((t) => t.toLowerCase().includes(q))
    )
  })

  const resetForm = () => {
    setFormData(initialFormData)
    setIsUpdateMode(false)
    setSelectedBlogId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    const hasNewImage = formData.imageUrl instanceof File

    if (!isUpdateMode && !hasNewImage) {
      toast.error('Cover image is required for new blog posts')
      return
    }

    let progressToastId: string | number | undefined

    try {
      const submitFormData = new FormData()
      submitFormData.append(
        'data',
        JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: normalizeStringArray(formData.tags),
          status: formData.status,
        })
      )

      if (hasNewImage) {
        submitFormData.append('file', formData.imageUrl as File)
      }

      if (isUpdateMode && selectedBlogId) {
        progressToastId = toast.loading('Updating blog post...')
        await updateBlog({ id: selectedBlogId, data: submitFormData })
        toast.success('Blog post updated successfully', { id: progressToastId })
      } else {
        progressToastId = toast.loading('Adding blog post...')
        await addBlog(submitFormData).unwrap()
        toast.success('Blog post added successfully', { id: progressToastId })
      }

      setIsModalOpen(false)
      resetForm()
      refetch()
    } catch (error: unknown) {
      toast.error(
        getRtkQueryErrorMessage(
          error,
          isUpdateMode ? 'Failed to update blog post' : 'Failed to add blog post'
        ),
        { id: progressToastId }
      )
    }
  }

  const handleEdit = (blog: TBlog) => {
    setSelectedBlogId(blog.id)
    setFormData({
      title: blog.title,
      content: blog.content,
      tags: normalizeStringArray(blog.tags),
      status: blog.status ?? 'Published',
      imageUrl: blog.imageUrl,
    })
    setIsUpdateMode(true)
    setIsModalOpen(true)
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      const response = await editorUpload(uploadFormData).unwrap()
      return response.data.file.url
    } catch (error: unknown) {
      console.error('Image upload failed:', error)
      toast.error(getRtkQueryErrorMessage(error, 'Failed to upload image'))
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBlog(id).unwrap()
      toast.success('Blog post deleted successfully')
      setDeleteModal({ isOpen: false, blogId: '' })
      refetch()
    } catch (error: unknown) {
      toast.error(getRtkQueryErrorMessage(error, 'Failed to delete blog post'))
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleFormDataChange = (data: Partial<BlogFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const handleAddClick = () => {
    resetForm()
    setIsModalOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto space-y-3"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-gray-100">Blog posts</h1>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] tabular-nums text-gray-400 ring-1 ring-line">
            {allBlogs.length}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <MdSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or tag…"
              className="h-8 w-48 rounded-lg border border-line bg-surface-1 pl-8 pr-3 text-[13px] text-gray-200 placeholder:text-gray-600 outline-none transition-colors focus:border-accent/60 sm:w-56"
            />
          </div>

          <div className="flex rounded-lg border border-line bg-surface-1 p-0.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  statusFilter === f ? 'bg-white/8 text-white' : 'text-gray-500 hover:text-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"
          >
            <MdAdd className="h-4 w-4" /> New post
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-190 table-fixed">
          <colgroup>
            <col />
            <col className="w-48" />
            <col className="w-28" />
            <col className="w-40" />
            <col className="w-32" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr>
              <th className="text-left">Post</th>
              <th className="text-left">Tags</th>
              <th className="text-left">Status</th>
              <th className="text-left">Author</th>
              <th className="text-left">Updated</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {isLoading ? (
                <tr>
                  <td colSpan={TABLE_COL_COUNT}>
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : blogInfo.length > 0 ? (
                blogInfo.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Post: thumbnail + title + excerpt */}
                    <td>
                      <div className="flex items-center gap-3 py-0.5">
                        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-line">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-600">
                              <MdArticle className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-gray-100" title={item.title}>
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>{renderTags(normalizeStringArray(item.tags))}</td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td>
                      {item.user ? (
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
                            {item.user.avaterUrl ? (
                              <Image
                                src={item.user.avaterUrl}
                                alt={item.user.name}
                                fill
                                sizes="24px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-white/10 text-[10px] font-semibold text-gray-300">
                                {item.user.name?.charAt(0) ?? '?'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 leading-tight">
                            <p className="truncate text-[12px] font-medium text-gray-200" title={item.user.name}>
                              {item.user.name}
                            </p>
                            <p className="truncate text-[10px] text-gray-500">{item.user.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap">
                      <p className="text-[12px] tabular-nums text-gray-300">{formatDate(item.updatedAt)}</p>
                      <p className="text-[10px] tabular-nums text-gray-600">Created {formatDate(item.createdAt)}</p>
                    </td>

                    <td>
                      <div className="flex justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          aria-label={`Edit ${item.title}`}
                          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-indigo-300"
                        >
                          <MdEdit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ isOpen: true, blogId: item.id })}
                          title="Delete"
                          aria-label={`Delete ${item.title}`}
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
                  <td colSpan={TABLE_COL_COUNT}>
                    <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                      <MdArticle className="h-7 w-7 text-gray-600" />
                      <p className="text-[13px] font-medium text-gray-300">
                        {allBlogs.length === 0 ? 'No blog posts yet' : 'No posts match your filters'}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {allBlogs.length === 0 ? 'Create your first post to get started.' : 'Try a different search or status.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div {...modalMotionProps}>
            <BlogFormModal
              isOpen={isModalOpen}
              isUpdateMode={isUpdateMode}
              formData={formData}
              onClose={handleModalClose}
              onSubmit={handleSubmit}
              onFormDataChange={handleFormDataChange}
              onImageUpload={handleImageUpload}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div {...modalMotionProps}>
            <DeleteBlogModal
              isOpen={deleteModal.isOpen}
              onClose={() => setDeleteModal({ isOpen: false, blogId: '' })}
              onDelete={handleDelete}
              blogId={deleteModal.blogId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ManageBlog
