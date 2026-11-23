'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdPerson, MdLink, MdDescription, MdCameraAlt, MdDelete } from 'react-icons/md';
import type { AboutFormPayload } from '@/components/Types/about.type';
import Image from '@/components/Common/OptimizedImage';
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

const MAX_IMAGE_MB = 10;
const BIO_MAX = 600;

const label = 'mb-1.5 block text-[12px] font-medium text-gray-400';
const field =
  'h-9 w-full rounded-lg border border-line bg-surface-0 px-3 text-[13px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60 disabled:opacity-50';

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
  const [localPreview, setLocalPreview] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  if (!isOpen) return null;

  const avatar = localPreview || formData.imageUrl;
  const initial = (formData.nameTitle.trim()[0] || '?').toUpperCase();
  const bioLen = formData.shortdescription.length;

  const pickFile = async (file: File | undefined) => {
    if (!file || imageBusy) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_MB}MB`);
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setImageBusy(true);
    try {
      const url = await onImageUpload(file);
      if (!url?.trim()) {
        toast.error('Upload did not return an image URL');
        setLocalPreview('');
        return;
      }
      if (url.startsWith('blob:')) {
        toast.error('Invalid image URL from server');
        setLocalPreview('');
        return;
      }
      onChange({ imageUrl: url.trim() });
      setLocalPreview('');
      toast.success('Photo uploaded');
    } catch (e: unknown) {
      setLocalPreview('');
      toast.error(getRtkQueryErrorMessage(e, 'Image upload failed'));
    } finally {
      setImageBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removePhoto = () => {
    setLocalPreview('');
    onChange({ imageUrl: '' });
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-form-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
            <MdPerson className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="about-form-title" className="text-[15px] font-semibold text-gray-100">
              {isUpdateMode ? 'Edit profile' : 'Set up your profile'}
            </h2>
            <p className="text-[12px] text-gray-500">This is the public intro shown on your portfolio.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {/* Identity row */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex shrink-0 flex-col items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={imageBusy}
                  aria-label="Change profile photo"
                  className="group relative h-28 w-28 overflow-hidden rounded-full bg-white/5 ring-2 ring-line transition-shadow hover:ring-accent/60 disabled:cursor-wait"
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="Profile photo"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-gray-500">
                      {initial}
                    </span>
                  )}
                  <span
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/55 text-[11px] font-medium text-white transition-opacity ${
                      imageBusy ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {imageBusy ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <MdCameraAlt className="h-5 w-5" />
                        {avatar ? 'Change' : 'Upload'}
                      </>
                    )}
                  </span>
                </button>

                <div className="flex items-center gap-3 text-[11px]">
                  {avatar && !imageBusy && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="flex items-center gap-1 text-gray-500 hover:text-rose-400"
                    >
                      <MdDelete className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowUrlField((v) => !v)}
                    className="text-gray-500 hover:text-gray-200"
                  >
                    {showUrlField ? 'Hide URL' : 'Use URL'}
                  </button>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <label htmlFor="about-name" className={label}>
                    Full name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="about-name"
                    type="text"
                    value={formData.nameTitle}
                    onChange={(e) => onChange({ nameTitle: e.target.value })}
                    placeholder="Md Abdul Adud"
                    required
                    autoFocus
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="about-profession" className={label}>
                    Profession <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="about-profession"
                    type="text"
                    value={formData.professonName}
                    onChange={(e) => onChange({ professonName: e.target.value })}
                    placeholder="React Web Developer"
                    required
                    className={field}
                  />
                </div>
              </div>
            </div>

            {showUrlField && (
              <div>
                <label htmlFor="about-photo-url" className={label}>
                  Photo URL <span className="font-normal text-gray-600">(optional — fills automatically after upload)</span>
                </label>
                <input
                  id="about-photo-url"
                  type="url"
                  value={formData.imageUrl}
                  disabled={imageBusy}
                  onChange={(e) => onChange({ imageUrl: e.target.value })}
                  placeholder="https://…"
                  className={field}
                />
              </div>
            )}

            {/* Bio */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="about-bio" className="text-[12px] font-medium text-gray-400">
                  Short bio <span className="text-rose-400">*</span>
                </label>
                <span className={`text-[11px] tabular-nums ${bioLen > BIO_MAX ? 'text-amber-400' : 'text-gray-600'}`}>
                  {bioLen}/{BIO_MAX}
                </span>
              </div>
              <textarea
                id="about-bio"
                value={formData.shortdescription}
                onChange={(e) => onChange({ shortdescription: e.target.value })}
                placeholder="A few sentences about who you are and what you do…"
                rows={5}
                required
                className="w-full resize-none rounded-lg border border-line bg-surface-0 px-3 py-2 text-[13px] leading-relaxed text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60"
              />
            </div>

            {/* Documents */}
            <div>
              <span className={label}>Documents</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <MdDescription className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={formData.resumeUrl}
                    onChange={(e) => onChange({ resumeUrl: e.target.value })}
                    placeholder="Resume URL"
                    aria-label="Resume URL"
                    className={`${field} pl-8`}
                  />
                </div>
                <div className="relative">
                  <MdLink className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={formData.cvUrl}
                    onChange={(e) => onChange({ cvUrl: e.target.value })}
                    placeholder="CV URL"
                    aria-label="CV URL"
                    className={`${field} pl-8`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-surface-0/50 px-5 py-3">
            <p className="hidden text-[11px] text-gray-600 sm:block">
              <span className="text-rose-400">*</span> Required · Esc to close
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg border border-line px-4 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={imageBusy}
                className="h-9 rounded-lg bg-violet-600 px-5 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {imageBusy ? 'Uploading photo…' : isUpdateMode ? 'Save changes' : 'Create profile'}
              </button>
            </div>
          </footer>
        </form>
      </motion.div>
    </div>
  );
};

export default AboutFormModal;
