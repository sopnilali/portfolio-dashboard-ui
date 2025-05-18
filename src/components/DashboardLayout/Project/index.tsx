'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { MdDelete, MdEdit, MdAdd } from 'react-icons/md'
import { toast } from 'sonner'
import ProjectFormModal from '@/components/Modals/ProjectFormModal'
import DeleteProjectModal from '@/components/Modals/DeleteProjectModal'
import { useAddProjectMutation, useDeleteProjectMutation, useGetAllProjectsQuery, useGetProjectQuery, useUpdateProjectMutation } from '@/components/Redux/features/project/projectApi'


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

    console.log("FormData at submission:", formData);
    console.log("ImageUrl type:", formData.imageUrl ? formData.imageUrl.constructor.name : 'null');

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
    
    console.log("Data to send:", dataToSend);
    
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
        const response = await updateProject({ id: selectedProjectId, data: formdata });
        console.log(response)
        toast.success('Project updated successfully');
      } else {
        const response = await addProject(formdata).unwrap();
        console.log(response)
        toast.success('Project added successfully');
      }

      setIsModalOpen(false);
      setIsUpdateMode(false);
      setSelectedProjectId('');
      refetch();
    } catch (error) {
      console.error("Project submission error:", error);
      toast.error(isUpdateMode ? 'Failed to update project' : 'Failed to add project');
    }
  };

  const handleEdit = (project: any) => {
    console.log("Project to edit:", project);
    
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
    try {
      await deleteProject(id).unwrap();
      toast.success('Project deleted successfully');
      setDeleteModal({ isOpen: false, projectId: '' });
      refetch();
    } catch (error) {
      toast.error('Failed to delete project');    
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
      console.log("File received in handleImageUpload:", file);
      
      // Store the actual File object directly in imageUrl
      setFormData(prev => {
        console.log("Previous formData:", prev);
        const updated = {
          ...prev,
          imageUrl: file // Store the actual File object
        };
        console.log("Updated formData:", updated);
        return updated;
      });
      
      // For debugging
      setTimeout(() => {
        console.log("Current formData after update:", formData);
      }, 100);
      
      return '';
    } catch (error) {
      console.error('Image handling failed:', error);
      toast.error('Failed to process image');
      return '';
    }
  };

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Projects</h1>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-600 text-white px-2 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
        >
          <MdAdd /> Add Project
        </button>
      </div>

      <div className="overflow-x-auto rounded">
        <table className="min-w-full bg-gray-800 rounded-lg shadow-lg">
          <thead className="bg-gray-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Technology</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-300 divide-y divide-gray-600">
            {projectInfo?.map((item: any) => (
              <tr key={item.id} className='hover:bg-gray-100 duration-500 transition-all' >
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'Completed' ? 'bg-green-200 text-green-800' : 
                    item.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' : 
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <MdEdit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, projectId: item.id })} 
                    className="text-red-600 hover:text-red-900"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        isUpdateMode={isUpdateMode}
        formData={formData}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        onFormDataChange={handleFormDataChange}
        onImageUpload={handleImageUpload}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, projectId: '' })}
        onDelete={handleDelete}
        projectId={deleteModal.projectId}
      />
    </div>
  )
}

export default ManageProject
