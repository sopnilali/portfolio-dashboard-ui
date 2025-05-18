import { MdAdd, MdClose, MdUpdate } from 'react-icons/md';
import { useState, useEffect } from 'react';
import ImageUpload from '@/components/Common/ImageUpload';

interface ProjectFormModalProps {
  isOpen: boolean;
  isUpdateMode: boolean;
  formData: {
    title: string;
    description: string;
    technology: string[];
    duration: string;
    liveUrl: string;
    backendrepoUrl: string;
    frontendrepoUrl: string;
    imageUrl: string | File | null;
    imageFile?: File;
  };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFormDataChange: (data: Partial<ProjectFormModalProps['formData']>) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const ProjectFormModal = ({
  isOpen,
  isUpdateMode,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
  onImageUpload
}: ProjectFormModalProps) => {
  const [techInput, setTechInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    console.log("Current image source:", formData.imageUrl);
    
    if (formData.imageFile) {
      const url = URL.createObjectURL(formData.imageFile);
      console.log("Preview from imageFile:", url);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (formData.imageUrl instanceof File) {
      // If imageUrl is a File object
      const url = URL.createObjectURL(formData.imageUrl);
      console.log("Preview from imageUrl File:", url);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof formData.imageUrl === 'string' && formData.imageUrl) {
      // If imageUrl is a non-empty string (URL from server)
      console.log("Preview from imageUrl string:", formData.imageUrl);
      setPreviewUrl(formData.imageUrl);
    } else {
      console.log("No preview source available");
      setPreviewUrl('');
    }
  }, [formData.imageFile, formData.imageUrl]);

  if (!isOpen) return null;

  const handleAddTechnology = () => {
    if (techInput.trim()) {
      const newTech = techInput.trim();
      if (!formData.technology.includes(newTech)) {
        onFormDataChange({ 
          technology: [...formData.technology, newTech] 
        });
      }
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (techToRemove: string) => {
    onFormDataChange({
      technology: formData.technology.filter(tech => tech !== techToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechnology();
    }
  };

  const handleImageChange = async (file: File | null) => {
    console.log("File in handleImageChange:", file);
    
    if (file) {
      try {
        console.log("Uploading file...");
        // Direct file handling - store the File object without any transformation
        onFormDataChange({ 
          imageUrl: file // Store the File object directly
        });
        
        // Log what was stored
        console.log("Stored file in formData.imageUrl:", file);
        
        // Still call the upload function for backend processing
        const result = await onImageUpload(file);
        console.log("Upload result:", result);
      } catch (error) {
        console.error("Error in handleImageChange:", error);
      }
    } else {
      onFormDataChange({ 
        imageUrl: null
      });
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-7xl transform transition-all duration-300 ease-in-out max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {isUpdateMode ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <MdClose className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Project Image</label>
            <ImageUpload
              currentImage={previewUrl}
              onImageChange={handleImageChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => onFormDataChange({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-800"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => onFormDataChange({ duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Live URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => onFormDataChange({ liveUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Frontend Repo URL</label>
              <input
                type="url"
                value={formData.frontendrepoUrl}
                onChange={(e) => onFormDataChange({ frontendrepoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Backend Repo URL</label>
              <input
                type="url"
                value={formData.backendrepoUrl}
                onChange={(e) => onFormDataChange({ backendrepoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Technologies</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-gray-800"
                  placeholder="Enter a technology"
                />
                <button
                  type="button"
                  onClick={handleAddTechnology}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <MdAdd className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technology.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-600 rounded-full text-sm flex items-center gap-1 group"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(tech)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 min-h-[100px] text-gray-800"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              {isUpdateMode ? (
                <>
                  <MdUpdate className="w-5 h-5" />
                  Update Project
                </>
              ) : (
                <>
                  <MdAdd className="w-5 h-5" />
                  Add Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;