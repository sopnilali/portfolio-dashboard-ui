'use client';

import { useRef, useState } from 'react';
import { MdCloudUpload, MdDelete, MdSwapHoriz } from 'react-icons/md';
import { toast } from 'sonner';
import Image from '@/components/Common/OptimizedImage';

interface CoverUploadProps {
  /** Preview source: remote URL, blob: URL or empty */
  previewUrl: string;
  onChange: (file: File | null) => void;
  maxMB?: number;
  /** Tailwind aspect class, e.g. "aspect-video" */
  aspect?: string;
  sizes?: string;
}

const CoverUpload = ({
  previewUrl,
  onChange,
  maxMB = 10,
  aspect = 'aspect-video',
  sizes = '400px',
}: CoverUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Image must be under ${maxMB}MB`);
      return;
    }
    onChange(file);
  };

  const remove = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {previewUrl ? (
        <div className={`group relative ${aspect} overflow-hidden rounded-xl ring-1 ring-line`}>
          <Image src={previewUrl} alt="Cover preview" fill sizes={sizes} className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[12px] font-medium text-gray-900 hover:bg-white"
            >
              <MdSwapHoriz className="h-4 w-4" /> Replace
            </button>
            <button
              type="button"
              onClick={remove}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500/90 px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-rose-500"
            >
              <MdDelete className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          className={`flex ${aspect} w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed transition-colors ${
            dragActive
              ? 'border-accent bg-accent/10 text-gray-200'
              : 'border-gray-600 text-gray-500 hover:border-gray-500 hover:text-gray-300'
          }`}
        >
          <MdCloudUpload className="h-8 w-8" />
          <span className="text-[12px] font-medium">Drop an image or click to upload</span>
          <span className="text-[11px] text-gray-600">PNG, JPG, WEBP · max {maxMB}MB</span>
        </button>
      )}
    </div>
  );
};

export default CoverUpload;
