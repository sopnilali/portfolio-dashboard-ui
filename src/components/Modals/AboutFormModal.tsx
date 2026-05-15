'use client';

import { useState } from 'react';
import { MdClose, MdAdd, MdUpdate, MdOutlineCloudUpload } from 'react-icons/md';
import type { AboutFormPayload } from '@/components/Types/about.type';
import ImageUpload from '@/components/Common/ImageUpload';
import { toast } from 'sonner';
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage';

interface AboutFormModalProps {
  isOpen: boolean;
  isUpdateMode: boolean;
  formData: AboutFormPayload;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<AboutFormPayload>) => void;
  /** Upload picked file → public image URL + store in imageUrl field */
  onImageUpload: (file: File) => Promise<string>;
}

const AboutFormModal = ({
  isOpen,
  isUpdateMode,
  formData,
  onClose,
  onSubmit,
  onChange,
  onImageUpload,
}: AboutFormModalProps) => {
  const [imageBusy, setImageBusy] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (file: File | null) => {
    if (!file) {
      onChange({ imageUrl: '' });
      return;
    }
    void (async () => {
      setImageBusy(true);
      try {
        const url = await onImageUpload(file);
        if (!url?.trim()) {
          toast.error('Upload did not return an image URL');
          return;
        }
        if (url.startsWith('blob:')) {
          toast.error('Invalid image URL from server');
          return;
        }
        onChange({ imageUrl: url.trim() });
        toast.success('Photo uploaded');
      } catch (e: unknown) {
        toast.error(getRtkQueryErrorMessage(e, 'Image upload failed'));
      } finally {
        setImageBusy(false);
      }
    })();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isUpdateMode ? 'Edit profile / about' : 'Add profile / about'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Name / title</label>
            <input
              type="text"
              value={formData.nameTitle}
              onChange={(e) => onChange({ nameTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholder="Md Abdul Adud"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Profession</label>
            <input
              type="text"
              value={formData.professonName}
              onChange={(e) => onChange({ professonName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholder="React Web Developers"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Saved as <code className="text-gray-600">professonName</code> for your API.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Short description</label>
            <textarea
              value={formData.shortdescription}
              onChange={(e) => onChange({ shortdescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white min-h-[120px] text-sm resize-y"
              placeholder="Intro paragraph for your portfolio…"
              required
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-900">Profile photo</label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Upload JPG/PNG — stored via editor upload API, URL saved as <code className="text-gray-600">imageUrl</code>.
                </p>
              </div>
              {imageBusy && (
                <span className="inline-flex items-center gap-1 shrink-0 text-xs font-medium text-violet-700 bg-violet-50 px-2 py-1 rounded-md border border-violet-200">
                  <MdOutlineCloudUpload className="w-4 h-4 animate-pulse" />
                  Uploading…
                </span>
              )}
            </div>
            <ImageUpload
              currentImage={formData.imageUrl || ''}
              onImageChange={(f) => {
                if (f === null) {
                  onChange({ imageUrl: '' });
                  return;
                }
                if (!imageBusy) handleImageChange(f);
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Photo URL <span className="text-gray-400 font-normal">(optional fallback)</span>
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              disabled={imageBusy}
              onChange={(e) => onChange({ imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white disabled:opacity-50"
              placeholder="https://… or leave empty after upload"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Resume URL</label>
            <input
              type="url"
              value={formData.resumeUrl}
              onChange={(e) => onChange({ resumeUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholder="https://…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">CV URL</label>
            <input
              type="url"
              value={formData.cvUrl}
              onChange={(e) => onChange({ cvUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholder="https://…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={imageBusy}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium inline-flex items-center gap-1 disabled:opacity-50"
            >
              {isUpdateMode ? <MdUpdate className="w-4 h-4" /> : <MdAdd className="w-4 h-4" />}
              {isUpdateMode ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutFormModal;
