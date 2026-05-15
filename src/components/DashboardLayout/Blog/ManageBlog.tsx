'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useGetAllBlogsQuery, useAddBlogMutation, useEditorUploadMutation, useDeleteBlogMutation, useUpdateBlogMutation, useGetBlogQuery } from '@/components/Redux/features/blog/blogApi'
import { MdDelete, MdEdit, MdAdd } from 'react-icons/md'
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

const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const initialFormData: BlogFormData = {
  title: '',
  shortdescription: '',
  content: '',
  tags: [],
  status: 'Published',
  imageUrl: null,
}

const TABLE_COL_COUNT = 9
const MAX_VISIBLE_TAGS = 2

const TH_CLASS = 'px-2 py-1.5 text-[10px] font-semibold text-gray-100 uppercase tracking-wide whitespace-nowrap'
const TD_CLASS = 'px-2 py-1.5 text-xs text-gray-200 align-middle'

const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.substring(0, maxLength)}…` : text

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

const getStatusBadgeClass = (status: string) => {
  if (status === 'Published') return 'bg-emerald-900/60 text-emerald-300'
  return 'bg-amber-900/60 text-amber-300'
}

const renderCompactTags = (tags: string[]) => {
  const visible = tags.slice(0, MAX_VISIBLE_TAGS)
  const remaining = tags.length - visible.length

  return (
    <div className="flex flex-wrap gap-0.5 w-full min-w-0">
      {visible.map((tag) => (
        <span key={tag} className="px-1 py-0.5 bg-gray-700/70 rounded text-[10px] text-gray-100 leading-tight min-w-0 max-w-[calc(100%-0.25rem)] truncate">
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="px-1 py-0.5 bg-gray-600/70 rounded text-[10px] text-gray-300 leading-tight whitespace-nowrap">
          +{remaining}
        </span>
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

  const blogInfo = normalizeList<TBlog>(blogs?.data)

  const resetForm = () => {
    setFormData(initialFormData)
    setIsUpdateMode(false)
    setSelectedBlogId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.shortdescription.trim() || !formData.content.trim()) {
      toast.error('Title, short description, and content are required')
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
          shortdescription: formData.shortdescription,
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
      shortdescription: blog.shortdescription,
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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Manage Blog Posts</h1>
        <motion.button
          type="button"
          onClick={handleAddClick}
          className="bg-slate-700/90 text-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700/80"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <MdAdd /> Add Blog
        </motion.button>
      </div>

      <div className="overflow-x-auto rounded" style={{ overflowY: 'hidden' }}>
        <motion.table
          className="w-full table-fixed bg-gray-900 rounded-lg shadow-lg text-xs border-collapse"
          variants={tableContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <colgroup>
            {Array.from({ length: TABLE_COL_COUNT }, (_, index) => (
              <col key={index} style={{ width: `${100 / TABLE_COL_COUNT}%` }} />
            ))}
          </colgroup>
          <thead className="bg-slate-700/90 text-gray-100">
            <tr>
              <th className={`${TH_CLASS} text-center`}>Img</th>
              <th className={`${TH_CLASS} text-left`}>Title</th>
              <th className={`${TH_CLASS} text-left`}>Preview</th>
              <th className={`${TH_CLASS} text-left`}>Tags</th>
              <th className={`${TH_CLASS} text-center`}>Status</th>
              <th className={`${TH_CLASS} text-left`}>By</th>
              <th className={`${TH_CLASS} text-center`}>Created</th>
              <th className={`${TH_CLASS} text-center`}>Updated</th>
              <th className={`${TH_CLASS} text-center`}>Act.</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={TABLE_COL_COUNT}>
                    <div className="flex justify-center items-center py-6 text-gray-400">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : blogInfo.length > 0 ? (
                blogInfo.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    className="hover:bg-gray-700 duration-500 transition-all"
                    variants={tableRowVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <td className={`${TD_CLASS} text-center`}>
                      <div className="w-10 h-10 relative mx-auto">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center text-[8px] text-gray-500 leading-none">
                            —
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`${TD_CLASS} max-w-0 min-w-0`}>
                      <p className="text-gray-100 font-medium truncate" title={item.title}>
                        {item.title}
                      </p>
                    </td>
                    <td className={`${TD_CLASS} max-w-0 min-w-0`}>
                      <p className="text-gray-300 line-clamp-2 leading-snug" title={item.shortdescription}>
                        {truncateText(item.shortdescription ?? '', 52)}
                      </p>
                    </td>
                    <td className={`${TD_CLASS} max-w-0 min-w-0 overflow-hidden`}>{renderCompactTags(normalizeStringArray(item.tags))}</td>
                    <td className={`${TD_CLASS} text-center whitespace-nowrap`}>
                      <span
                        className={`inline-block max-w-full truncate px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusBadgeClass(item.status)}`}
                        title={item.status}
                      >
                        {item.status === 'Published' ? 'Pub.' : item.status}
                      </span> bn
                    </td>
                    <td className={`${TD_CLASS} max-w-0 min-w-0`}>
                      {item.user ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-6 h-6 relative rounded-full overflow-hidden shrink-0">
                            {item.user.avaterUrl ? (
                              <Image
                                src={item.user.avaterUrl}
                                alt={item.user.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-[10px] text-gray-300">
                                {item.user.name?.charAt(0) ?? '?'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-100 font-medium truncate text-[11px] leading-tight" title={item.user.name}>
                              {item.user.name}
                            </p>
                            <p className="text-[10px] text-gray-500 leading-tight truncate">{item.user.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className={`${TD_CLASS} text-center whitespace-nowrap text-[11px] text-gray-400 tabular-nums`}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td className={`${TD_CLASS} text-center whitespace-nowrap text-[11px] text-gray-400 tabular-nums`}>
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className={`${TD_CLASS} text-center whitespace-nowrap`}>
                      <motion.button
                        onClick={() => handleEdit(item)}
                        className="mr-1 p-0.5 text-indigo-400 hover:text-indigo-300 cursor-pointer align-middle inline-flex"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdEdit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => setDeleteModal({ isOpen: true, blogId: item.id })}
                        className="p-0.5 text-rose-400 hover:text-rose-300 cursor-pointer align-middle inline-flex"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdDelete className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={TABLE_COL_COUNT}>
                    <div className="flex justify-center items-center py-10">
                      <span className="text-gray-400 text-sm font-medium">Not found</span>
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
