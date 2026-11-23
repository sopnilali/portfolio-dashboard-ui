'use client';

import {
  MdClose,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdCloudUpload,
  MdDelete,
  MdSwapHoriz,
  MdArticle,
} from 'react-icons/md';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import TiptapEditor from '../Editor/TiptapEditor';
import Image from '@/components/Common/OptimizedImage';
import type { BlogFormData, BlogStatus } from '@/components/Types/blog.type';
import { normalizeStringArray } from '@/components/Utils/normalizeArray';

interface BlogFormModalProps {
  isOpen: boolean;
  isUpdateMode: boolean;
  formData: BlogFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFormDataChange: (data: Partial<BlogFormData>) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const BLOG_STATUSES: BlogStatus[] = ['Draft', 'Published'];
const READING_WPM = 200;
const MAX_IMAGE_MB = 10;

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWordsFromHtml(html: string) {
  const t = stripHtml(html);
  return t ? t.split(/\s+/).filter(Boolean).length : 0;
}

const panel = 'rounded-xl border border-line bg-surface-1';
const sectionTitle = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500';

const BlogFormModal = ({
  isOpen,
  isUpdateMode,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
  onImageUpload,
}: BlogFormModalProps) => {
  const [tagInput, setTagInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [mobileTab, setMobileTab] = useState<'write' | 'settings'>('write');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const words = useMemo(() => countWordsFromHtml(formData.content), [formData.content]);
  const readingMins = Math.max(1, Math.ceil(words / READING_WPM));
  const tags = normalizeStringArray(formData.tags);

  useEffect(() => {
    if (formData.imageUrl instanceof File) {
      const url = URL.createObjectURL(formData.imageUrl);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(typeof formData.imageUrl === 'string' ? formData.imageUrl : '');
  }, [formData.imageUrl]);

  useEffect(() => {
    if (isOpen) setMobileTab('write');
  }, [isOpen]);

  // Auto-grow the title field
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [formData.title, isOpen, mobileTab]);

  const hasContent = Boolean(formData.title.trim() || stripHtml(formData.content));

  const requestClose = () => {
    if (!isUpdateMode && hasContent && !window.confirm('Discard this post? Your changes will be lost.')) {
      return;
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasContent, isUpdateMode]);

  if (!isOpen) return null;

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').trim();
    if (tag && !tags.includes(tag)) {
      onFormDataChange({ tags: [...tags, tag] });
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      onFormDataChange({ tags: tags.slice(0, -1) });
    }
  };

  const removeTag = (tag: string) => onFormDataChange({ tags: tags.filter((t) => t !== tag) });

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_MB}MB`);
      return;
    }
    onFormDataChange({ imageUrl: file });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    onFormDataChange({ imageUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const checklist = [
    { label: 'Title', done: Boolean(formData.title.trim()) },
    { label: 'Cover image', done: Boolean(previewUrl) },
    { label: 'Content', done: words > 0 },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const submitLabel = isUpdateMode
    ? 'Save changes'
    : formData.status === 'Published'
      ? 'Publish'
      : 'Save draft';

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-composer-heading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex flex-col bg-surface-0"
    >
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface-1 px-3 sm:px-5">
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close editor"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <MdClose className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 id="blog-composer-heading" className="truncate text-[13px] font-semibold text-gray-100">
            {isUpdateMode ? 'Edit post' : 'New post'}
          </h1>
          <p className="hidden text-[11px] tabular-nums text-gray-500 sm:block">
            {words} words · ~{readingMins} min read
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="flex rounded-lg border border-line bg-surface-0 p-0.5" role="group" aria-label="Post status">
            {BLOG_STATUSES.map((status) => {
              const active = formData.status === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onFormDataChange({ status })}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    active ? 'bg-white/8 text-white' : 'text-gray-500 hover:text-gray-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active ? (status === 'Published' ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-gray-600'
                    }`}
                  />
                  {status}
                </button>
              );
            })}
          </div>

          <button
            form="blog-composer-form"
            type="submit"
            className="h-8 rounded-lg bg-violet-600 px-4 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"
          >
            {submitLabel}
          </button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="flex border-b border-line bg-surface-1 p-1 lg:hidden">
        {(['write', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex-1 rounded-md py-1.5 text-center text-[12px] font-medium transition-colors ${
              mobileTab === tab ? 'bg-white/8 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'write' ? 'Write' : 'Settings'}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Writing area */}
        <form
          id="blog-composer-form"
          onSubmit={onSubmit}
          className={`min-w-0 flex-1 overflow-y-auto ${mobileTab === 'settings' ? 'hidden lg:block' : 'block'}`}
        >
          <div className="w-full space-y-4 px-4 py-6 sm:px-6">
            <div>
              <label htmlFor="blog-title" className="sr-only">
                Title
              </label>
              <textarea
                id="blog-title"
                ref={titleRef}
                rows={1}
                value={formData.title}
                onChange={(e) => onFormDataChange({ title: e.target.value.replace(/\n/g, ' ') })}
                placeholder="Post title"
                required
                className="w-full resize-none overflow-hidden border-0 bg-transparent text-3xl font-bold leading-tight tracking-tight text-gray-100 outline-none placeholder:text-gray-700 sm:text-4xl"
              />
            </div>

            <div className="editor-light overflow-hidden rounded-xl border border-line shadow-sm">
              <TiptapEditor
                content={formData.content}
                onChange={(content) => onFormDataChange({ content })}
                onImageUpload={onImageUpload}
              />
            </div>
          </div>
        </form>

        {/* Settings */}
        <aside
          className={`w-full shrink-0 space-y-4 overflow-y-auto border-l border-line bg-surface-0 p-4 lg:block lg:w-85 ${
            mobileTab === 'write' ? 'hidden' : 'block'
          }`}
        >
          {/* Checklist */}
          <section className={`${panel} p-4`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className={sectionTitle}>Ready to publish</h2>
              <span className="text-[11px] tabular-nums text-gray-500">
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <ul className="space-y-1.5">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-[13px]">
                  {c.done ? (
                    <MdCheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <MdRadioButtonUnchecked className="h-4 w-4 text-gray-600" />
                  )}
                  <span className={c.done ? 'text-gray-300' : 'text-gray-500'}>{c.label}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Cover image */}
          <section className={`${panel} p-4`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className={sectionTitle}>Cover image</h2>
              {!isUpdateMode && !previewUrl && <span className="text-[11px] text-amber-400">Required</span>}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />

            {previewUrl ? (
              <div className="group relative aspect-video overflow-hidden rounded-lg ring-1 ring-line">
                <Image src={previewUrl} alt="Cover preview" fill sizes="340px" className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-[12px] font-medium text-gray-900 hover:bg-white"
                  >
                    <MdSwapHoriz className="h-4 w-4" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-500/90 px-2.5 py-1.5 text-[12px] font-medium text-white hover:bg-rose-500"
                  >
                    <MdDelete className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed transition-colors ${
                  dragActive
                    ? 'border-accent bg-accent/10 text-gray-200'
                    : 'border-gray-600 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                }`}
              >
                <MdCloudUpload className="h-7 w-7" />
                <span className="text-[12px] font-medium">Drop an image or click to upload</span>
                <span className="text-[11px] text-gray-600">PNG, JPG, WEBP · max {MAX_IMAGE_MB}MB</span>
              </button>
            )}
          </section>

          {/* Tags */}
          <section className={`${panel} p-4`}>
            <h2 className={`${sectionTitle} mb-2`}>Tags</h2>
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface-0 p-2 focus-within:border-accent/60">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 text-[12px] text-violet-300 ring-1 ring-violet-500/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="rounded text-violet-400 hover:text-white"
                  >
                    <MdClose className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
                placeholder={tags.length ? 'Add tag…' : 'Type a tag, press Enter'}
                className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-[13px] text-gray-200 outline-none placeholder:text-gray-600"
              />
            </div>
          </section>

          {/* Preview */}
          <section className={`${panel} p-4`}>
            <h2 className={`${sectionTitle} mb-2`}>Card preview</h2>
            <div className="overflow-hidden rounded-lg border border-line bg-surface-0">
              <div className="relative aspect-video bg-white/5">
                {previewUrl ? (
                  <Image src={previewUrl} alt="" fill sizes="340px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-700">
                    <MdArticle className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    formData.status === 'Published'
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-amber-500/10 text-amber-300'
                  }`}
                >
                  {formData.status}
                </span>
                <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-gray-100">
                  {formData.title || 'Untitled post'}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </motion.div>
  );
};

export default BlogFormModal;
