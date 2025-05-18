import React, { useState, useRef, useEffect } from 'react';
import { MdCloudUpload, MdDelete, MdAttachFile } from 'react-icons/md';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File | null) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle image preview when currentImage changes
  useEffect(() => {
    console.log("ImageUpload - currentImage:", currentImage);
    
    // Reset error state when image changes
    setImageError(false);
    
    if (!currentImage) {
      setPreview(null);
      setFileName('');
      return;
    }
    
    if (typeof currentImage === 'string') {
      setPreview(currentImage);
      // Try to extract filename from URL
      try {
        const url = new URL(currentImage);
        const pathParts = url.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        setFileName(lastPart || 'image');
      } catch (e) {
        // If it's not a valid URL, just use the string
        setFileName(currentImage.split('/').pop() || 'image');
      }
    }
  }, [currentImage]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFileName(file.name);
    onImageChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName('');
    onImageChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleImageError = () => {
    console.error("Image failed to load:", preview);
    setImageError(true);
  };

  return (
    <div 
      className={`relative ${className}`}
      onDragEnter={handleDrag}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview && !imageError ? (
        <div className="space-y-2">
          <div className="relative w-full h-48 group">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
              onError={handleImageError}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <MdDelete className="w-5 h-5" />
            </button>
          </div>
          
          {fileName && (
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
              <MdAttachFile className="text-gray-500" />
              <span className="text-sm text-gray-700 truncate">{fileName}</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            w-full h-48 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center gap-2
            cursor-pointer transition-colors duration-200
            ${dragActive 
              ? 'border-gray-600 bg-gray-100' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <MdCloudUpload className="w-10 h-10 text-gray-400" />
          <p className="text-sm text-gray-500">
            {imageError ? "Image failed to load. Click to select a new one." : "Drag and drop an image here, or click to select"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 