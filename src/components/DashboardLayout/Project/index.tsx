'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { MdDelete, MdEdit, MdAdd } from 'react-icons/md'
import { toast } from 'sonner'
import ProjectFormModal from '@/components/Modals/ProjectFormModal'
import DeleteProjectModal from '@/components/Modals/DeleteProjectModal'
import { useAddProjectMutation, useDeleteProjectMutation, useGetAllProjectsQuery, useGetProjectQuery, useUpdateProjectMutation } from '@/components/Redux/features/project/projectApi'
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

const ManageProject = () => {
  const { data: projects, isLoading, isError, refetch } = useGetAllProjectsQuery(undefined)
  const [addProject] = useAddProjectMutation()
  const [updateProject] = useUpdateProjectMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, projectId: '' })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technology: [] as string[],
    duration: '',
    liveUrl: '',
    backendrepoUrl: '',
    frontendrepoUrl: '',
    imageUrl: null as File | null | string,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const [deleteProject] = useDeleteProjectMutation()
  const { data: selectedProject } = useGetProjectQuery(selectedProjectId, {
    skip: !selectedProjectId,
  })

  const projectInfo = projects?.data
  const handleSubmit = async (e: React.FormEvent) => {



    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    const formdata = new FormData();
    
    // Create a data object with all text fields
    const dataToSend = {
      title: formData.title,
      description: formData.description,
      technology: formData.technology,
      duration: formData.duration,
      liveUrl: formData.liveUrl,
      backendrepoUrl: formData.backendrepoUrl,
      frontendrepoUrl: formData.frontendrepoUrl,
    };
    

    // Add the text data as JSON
    formdata.append('data', JSON.stringify(dataToSend));
    
    // Add file if imageUrl contains a File object
    if (formData.imageUrl instanceof File) {
      console.log("Adding file to FormData:", formData.imageUrl.name);
      formdata.append('file', formData.imageUrl);
    } else {
      console.log("No file to add, imageUrl is:", formData.imageUrl);
    }
    
    try {
      if (isUpdateMode && selectedProjectId) {
        const updateToastId = toast.loading('Updating project...')
        await updateProject({ id: selectedProjectId, data: formdata });
        toast.success('Project updated successfully', { id: updateToastId });
      } else {
        const addToastId = toast.loading('Adding project...')
        await addProject(formdata).unwrap();
        toast.success('Project added successfully', { id: addToastId });
      }

      setIsModalOpen(false);
      setIsUpdateMode(false);
      setSelectedProjectId('');
      refetch();
    } catch (error) {
      toast.error(isUpdateMode ? 'Failed to update project' : 'Failed to add project',);
    }
  };

  const handleEdit = (project: any) => {
    setSelectedProjectId(project.id);
    
    // Make sure the imageUrl is a full URL if it's a string from the server
    let imageUrl = project.imageUrl;
    
    // If the URL doesn't have a protocol, add it
    if (typeof imageUrl === 'string' && imageUrl && !imageUrl.startsWith('http')) {
      // Add your domain based on environment - adjust as needed
      const domain = process.env.NEXT_PUBLIC_API_URL || '';
      imageUrl = `${domain}/${imageUrl.replace(/^\/+/, '')}`;
      console.log("Formatted image URL:", imageUrl);
    }
    
    setFormData({
      title: project.title,
      description: project.description,
      technology: project.technology,
      duration: project.duration,
      liveUrl: project.liveUrl,
      backendrepoUrl: project.backendrepoUrl,
      frontendrepoUrl: project.frontendrepoUrl,
      imageUrl: imageUrl,
    });
    
    setIsUpdateMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const toastId = toast.loading('Deleting project...')
    try {
      await deleteProject(id).unwrap();
      toast.success('Project deleted successfully', { id: toastId });
      setDeleteModal({ isOpen: false, projectId: '' });
      refetch();
    } catch (error) {
        toast.error('Failed to delete project', { id: toastId });
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsUpdateMode(false);
    setSelectedProjectId('');
    setFormData({
      title: '',
      description: '',
      technology: [],
      duration: '',
      liveUrl: '',
      backendrepoUrl: '',
      frontendrepoUrl: '',
      imageUrl: null,
    });
  };

  const handleFormDataChange = (data: any) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  // Function to handle image uploads
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // Store the actual File object directly in imageUrl
      setFormData(prev => {
        const updated = {
          ...prev,
          imageUrl: file // Store the actual File object
        };
        return updated;
      });
      
      return '';
    } catch (error) {
      console.error('Image handling failed:', error);
      toast.error('Failed to process image');
      return '';
    }
  };

  return (
    <motion.div
      className="max-w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Projects</h1>
        <motion.button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-600 text-white px-2 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <MdAdd /> Add Project
        </motion.button>
      </div>

      <div className="overflow-x-auto rounded" style={{ overflowY: 'hidden' }}>
        <motion.table 
          className="min-w-full bg-gray-800 rounded-lg shadow-lg"
          variants={tableContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <thead className="bg-gray-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Technology</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Duration</th>
              {/* <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th> */}
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-300 divide-y divide-gray-600">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex justify-center items-center py-6 text-gray-800">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : projectInfo && projectInfo.length > 0 ? (
                projectInfo.map((item: any, index: number) => (
                  <motion.tr
                    key={item.id}
                    className="hover:bg-gray-100 transition-all duration-300"
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
                          src={item.imageUrl}
                          alt="Project thumbnail"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div className="max-w-md">
                        <p className="text-gray-800">
                          {item.description.length > 60 ? item.description.substring(0, 60) + '...' : item.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div className="flex flex-wrap gap-1">
                        {item.technology.map((tech: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.duration}</td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Completed' ? 'bg-green-200 text-green-800' : 
                        item.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' : 
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td> */}
                  
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
                        onClick={() => setDeleteModal({ isOpen: true, projectId: item.id })} 
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
                  <td colSpan={7}>
                    <div className="flex justify-center items-center py-12">
                      <span className="text-gray-500 text-lg font-semibold">
                        Not found. Please add your projects to showcase your work.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </motion.table>
      </div>

      {/* Project Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div {...modalMotionProps}>
            <ProjectFormModal
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
            <DeleteProjectModal
              isOpen={deleteModal.isOpen}
              onClose={() => setDeleteModal({ isOpen: false, projectId: '' })}
              onDelete={handleDelete}
              projectId={deleteModal.projectId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ManageProject
