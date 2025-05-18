'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useGetAllBlogsQuery, useAddBlogMutation, useEditorUploadMutation, useDeleteBlogMutation, useUpdateBlogMutation, useGetBlogQuery } from '@/components/Redux/features/blog/blogApi'
import { MdDelete, MdEdit, MdAdd } from 'react-icons/md'
import { toast } from 'sonner'
import DeleteBlogModal from '@/components/Modals/DeleteBlogModal'
import BlogFormModal from '@/components/Modals/BlogFormModal'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'

const modalMotionProps = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
  className: "fixed inset-0 z-50 flex items-center justify-center"
}

// Animation variants for table rows
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

// Table container animation
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

// Title animation
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

const ManageBlog = () => {
  const { data: blogs, isLoading, isError, refetch } = useGetAllBlogsQuery(undefined)
  const [addBlog] = useAddBlogMutation()
  const [updateBlog] = useUpdateBlogMutation()
  const [editorUpload] = useEditorUploadMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [selectedBlogId, setSelectedBlogId] = useState<string>('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, blogId: '' })
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    thumbnail: null as File | null
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const [deleteBlog] = useDeleteBlogMutation()
  const { data: selectedBlog } = useGetBlogQuery(selectedBlogId, {
    skip: !selectedBlogId,
  })

  const blogInfo = blogs?.data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const submitFormData = new FormData();
      submitFormData.append('data', JSON.stringify({
        title: formData.title,
        content: formData.content
      }));
      
      if (formData.thumbnail) {
        submitFormData.append('thumbnail', formData.thumbnail);
      }

      if (isUpdateMode && selectedBlogId) {
        const response = await updateBlog({ id: selectedBlogId, data: submitFormData });
        console.log(response)
        toast.success('Blog post updated successfully');
      } else {
        if (!formData.thumbnail) {
          toast.error('Thumbnail is required for new blog posts');
          return;
        }
        const response = await addBlog(submitFormData).unwrap();
        toast.success('Blog post added successfully');
      }

      setIsModalOpen(false);
      setIsUpdateMode(false);
      setSelectedBlogId('');
      setFormData({ title: '', content: '', thumbnail: null });
      refetch();
    } catch (error) {
      toast.error(isUpdateMode ? 'Failed to update blog post' : 'Failed to add blog post');
    }
  };

  const handleEdit = (blog: any) => {
    setSelectedBlogId(blog.id);
    setFormData({
      title: blog.title,
      content: blog.content,
      thumbnail: null
    });
    setIsUpdateMode(true);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await editorUpload(formData).unwrap()
      return response.data.file.url
    } catch (error) {
      console.error('Image upload failed:', error)
      toast.error('Failed to upload image')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBlog(id).unwrap();
      toast.success('Blog post deleted successfully');
      setDeleteModal({ isOpen: false, blogId: '' });
      refetch();
    } catch (error) {
      toast.error('Failed to delete blog post');    
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsUpdateMode(false);
    setSelectedBlogId('');
    setFormData({ title: '', content: '', thumbnail: null });
  };

  const handleFormDataChange = (data: { title?: string; content?: string; thumbnail?: File | null }) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
        <motion.button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-600 text-white px-2 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <MdAdd /> Add Blog
        </motion.button>
      </div>

      <div className="overflow-x-auto  rounded" style={{ overflowY: 'hidden' }}>
        <motion.table 
          className="min-w-full bg-gray-800 rounded-lg shadow-lg"
          variants={tableContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <thead className="bg-gray-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Thumbnail</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Content</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Posted Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Updated Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-300 divide-y divide-gray-600">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex justify-center items-center py-4 text-gray-800">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : blogInfo && blogInfo.length > 0 ? (
                blogInfo.map((item: any, index: number) => (
                  <motion.tr
                    key={item.id}
                    className='hover:bg-gray-100 duration-500 transition-all'
                    variants={tableRowVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 relative">
                        <Image
                          src={item.thumbnail}
                          alt="Blog thumbnail"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div className="max-w-md">
                        <div
                          className="text-gray-800"
                          dangerouslySetInnerHTML={{
                            __html: item.content.length > 60 ? item.content.substring(0, 60) + '...' : item.content
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{formatDate(item.updatedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <motion.button 
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdEdit className="w-5 h-5" />
                      </motion.button>
                      <motion.button 
                        onClick={() => setDeleteModal({ isOpen: true, blogId: item.id })} 
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdDelete className="w-5 h-5" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="flex justify-center items-center py-12">
                      <span className="text-gray-500 text-lg font-semibold">
                        Not found
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </motion.table>
      </div>

      {/* Blog Form Modal */}
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

      {/* Delete Confirmation Modal */}
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
