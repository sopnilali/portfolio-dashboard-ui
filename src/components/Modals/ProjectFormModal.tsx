'use client';

import { MdAdd, MdClose, MdLink, MdOutlineTimer, MdWorkOutline } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CoverUpload from '@/components/Common/CoverUpload';
import { normalizeStringArray } from '@/components/Utils/normalizeArray';

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

const SUGGESTED_TECH = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'PostgreSQL', 'Prisma', 'MongoDB', 'Redux'];
const DESCRIPTION_MAX = 600;

const label = 'mb-1.5 block text-[12px] font-medium text-gray-400';
const field =
  'h-9 w-full rounded-lg border border-line bg-surface-0 px-3 text-[13px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60';

const ProjectFormModal = ({
  isOpen,
  isUpdateMode,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
}: ProjectFormModalProps) => {
  const [techInput, setTechInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const technology = normalizeStringArray(formData.technology);

  useEffect(() => {
    const source = formData.imageFile ?? formData.imageUrl;
    if (source instanceof File) {
      const url = URL.createObjectURL(source);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(typeof source === 'string' ? source : '');
  }, [formData.imageFile, formData.imageUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const addTech = (raw: string) => {
    const tech = raw.trim().replace(/,$/, '').trim();
    if (tech && !technology.includes(tech)) {
      onFormDataChange({ technology: [...technology, tech] });
    }
    setTechInput('');
  };

  const removeTech = (tech: string) =>
    onFormDataChange({ technology: technology.filter((t) => t !== tech) });

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTech(techInput);
    } else if (e.key === 'Backspace' && !techInput && technology.length > 0) {
      onFormDataChange({ technology: technology.slice(0, -1) });
    }
  };

  const suggestions = SUGGESTED_TECH.filter((t) => !technology.includes(t));
  const descLen = formData.description.length;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
            <MdWorkOutline className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="project-form-title" className="text-[15px] font-semibold text-gray-100">
              {isUpdateMode ? 'Edit project' : 'New project'}
            </h2>
            <p className="text-[12px] text-gray-500">
              {isUpdateMode ? 'Update the details of this project.' : 'Add a project to showcase on your portfolio.'}
            </p>
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
          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 md:grid-cols-5">
            {/* Left: details */}
            <div className="space-y-4 md:col-span-3">
              <div>
                <label htmlFor="project-title" className={label}>
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => onFormDataChange({ title: e.target.value })}
                  placeholder="e.g. E-commerce dashboard"
                  required
                  autoFocus
                  className={field}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="project-description" className="text-[12px] font-medium text-gray-400">
                    Description <span className="text-rose-400">*</span>
                  </label>
                  <span
                    className={`text-[11px] tabular-nums ${descLen > DESCRIPTION_MAX ? 'text-amber-400' : 'text-gray-600'}`}
                  >
                    {descLen}/{DESCRIPTION_MAX}
                  </span>
                </div>
                <textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => onFormDataChange({ description: e.target.value })}
                  placeholder="What does it do, and what was your role?"
                  rows={5}
                  required
                  className="w-full resize-none rounded-lg border border-line bg-surface-0 px-3 py-2 text-[13px] leading-relaxed text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60"
                />
              </div>

              <div>
                <label htmlFor="project-duration" className={label}>
                  Duration
                </label>
                <div className="relative">
                  <MdOutlineTimer className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    id="project-duration"
                    type="text"
                    value={formData.duration ?? ''}
                    onChange={(e) => onFormDataChange({ duration: e.target.value })}
                    placeholder="e.g. 2 weeks"
                    className={`${field} pl-8`}
                  />
                </div>
              </div>

              <div>
                <span className={label}>Technologies</span>
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface-0 p-2 focus-within:border-accent/60">
                  {technology.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-[12px] text-violet-300 ring-1 ring-violet-500/20"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        aria-label={`Remove ${tech}`}
                        className="text-violet-400 hover:text-white"
                      >
                        <MdClose className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleTechKeyDown}
                    onBlur={() => techInput.trim() && addTech(techInput)}
                    placeholder={technology.length ? 'Add more…' : 'Type and press Enter'}
                    className="min-w-28 flex-1 bg-transparent px-1 py-0.5 text-[13px] text-gray-200 outline-none placeholder:text-gray-600"
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {suggestions.slice(0, 8).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addTech(s)}
                        className="inline-flex items-center gap-0.5 rounded-md border border-line px-2 py-0.5 text-[11px] text-gray-500 transition-colors hover:border-gray-500 hover:text-gray-200"
                      >
                        <MdAdd className="h-3 w-3" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: cover + links */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <span className={label}>Cover image</span>
                <CoverUpload
                  previewUrl={previewUrl}
                  onChange={(file) => onFormDataChange({ imageUrl: file })}
                  sizes="340px"
                />
              </div>

              <div className="space-y-3">
                <span className={label}>Links</span>

                <div className="relative">
                  <MdLink className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={formData.liveUrl ?? ''}
                    onChange={(e) => onFormDataChange({ liveUrl: e.target.value })}
                    placeholder="Live site URL"
                    aria-label="Live URL"
                    className={`${field} pl-8`}
                  />
                </div>

                <div className="relative">
                  <FaGithub className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={formData.frontendrepoUrl ?? ''}
                    onChange={(e) => onFormDataChange({ frontendrepoUrl: e.target.value })}
                    placeholder="Frontend repository URL"
                    aria-label="Frontend repo URL"
                    className={`${field} pl-8`}
                  />
                </div>

                <div className="relative">
                  <FaGithub className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    value={formData.backendrepoUrl ?? ''}
                    onChange={(e) => onFormDataChange({ backendrepoUrl: e.target.value })}
                    placeholder="Backend repository URL"
                    aria-label="Backend repo URL"
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
                className="h-9 rounded-lg bg-violet-600 px-5 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"
              >
                {isUpdateMode ? 'Save changes' : 'Create project'}
              </button>
            </div>
          </footer>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectFormModal;
