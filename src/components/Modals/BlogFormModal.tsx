'use client';

import {
  MdAdd,
  MdClose,
  MdUpdate,
  MdArticle,
  MdOutlineImage,
  MdOutlineSell,
  MdOutlineLocalOffer,
  MdOutlineVisibility,
  MdNotes,
} from 'react-icons/md';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import TiptapEditor from '../Editor/TiptapEditor';
import ImageUpload from '@/components/Common/ImageUpload';
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

const BLOG_STATUSES: BlogStatus[] = ['Published', 'Draft'];

const EXCERPT_SOFT_MAX = 280;
const READING_WPM = 200;

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWordsFromHtml(html: string) {
  const t = stripHtml(html);
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

const inputSurface =
  'w-full rounded-xl border border-zinc-600/80 bg-zinc-950/40 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/25';

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

  const words = useMemo(() => countWordsFromHtml(formData.content), [formData.content]);
  const readingMins = Math.max(1, Math.ceil(words / READING_WPM));
  const excerptLen = formData.shortdescription.length;

  useEffect(() => {
    if (formData.imageUrl instanceof File) {
      const url = URL.createObjectURL(formData.imageUrl);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof formData.imageUrl === 'string' && formData.imageUrl) {
      setPreviewUrl(formData.imageUrl);
    } else {
      setPreviewUrl('');
    }
  }, [formData.imageUrl]);

  useEffect(() => {
    if (isOpen) setMobileTab('write');
  }, [isOpen]);

  if (!isOpen) return null;

  const tags = normalizeStringArray(formData.tags);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      onFormDataChange({ tags: [...tags, tag] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onFormDataChange({ tags: tags.filter((tag) => tag !== tagToRemove) });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageChange = (file: File | null) => {
    onFormDataChange({ imageUrl: file });
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex cursor-default items-center justify-center bg-zinc-950/75 p-2 sm:p-4 md:p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-labelledby="blog-composer-heading"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-[min(92vh,900px)] w-full max-w-[1400px] cursor-auto flex-col overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65)]"
      >
        {/* Top bar — CMS shell */}
        <header className="flex shrink-0 flex-col gap-3 border-b border-zinc-800/90 bg-gradient-to-r from-zinc-950 via-zinc-900/95 to-zinc-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 ring-1 ring-violet-500/30">
              <MdArticle className="h-5 w-5 text-violet-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Content Studio
              </p>
              <h1 id="blog-composer-heading" className="truncate text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">
                {isUpdateMode ? 'Edit article' : 'New article'}
              </h1>
              <p className="hidden text-xs text-zinc-500 sm:block">
                <span className="text-zinc-400">Posts</span>
                <span className="mx-1.5 text-zinc-600">/</span>
                <span>{isUpdateMode ? 'Update draft' : 'Composer'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-900/80 px-2.5 py-1 ring-1 ring-zinc-800">
              <span className="hidden text-[11px] text-zinc-500 sm:inline">Stats</span>
              <span className="text-[11px] font-medium tabular-nums text-zinc-300">
                {words} words
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-[11px] tabular-nums text-zinc-400">~{readingMins} min read</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              >
                Close
              </button>
              <button
                form="blog-composer-form"
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 sm:text-sm"
              >
                {isUpdateMode ? (
                  <>
                    <MdUpdate className="h-4 w-4 shrink-0" />
                    Save changes
                  </>
                ) : (
                  <>
                    <MdAdd className="h-4 w-4 shrink-0" />
                    Publish post
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile: Write / Settings */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-1 md:hidden">
          {(['write', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 rounded-md py-2 text-center text-xs font-medium transition ${
                mobileTab === tab
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'write' ? 'Write' : 'Post settings'}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Composer column */}
          <section
            className={`min-h-0 min-w-0 flex-1 overflow-hidden p-3 sm:p-4 md:p-5 ${
              mobileTab === 'settings' ? 'hidden md:flex md:flex-1' : 'flex flex-col'
            }`}
          >
            <form
              id="blog-composer-form"
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/10 bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            >
              <div className="shrink-0 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/90 to-white px-4 py-4 sm:px-6 sm:py-5">
                <label className="sr-only">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => onFormDataChange({ title: e.target.value })}
                  className="w-full border-0 bg-transparent text-2xl font-bold tracking-tight text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-0 sm:text-3xl"
                  placeholder="Post title — make it clear and compelling"
                  required
                />
                <p className="mt-2 text-xs text-zinc-500">
                  This appears everywhere: dashboard, listings, and SEO as the main headline.
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col bg-white">
                <div className="flex min-h-[min(52vh,440px)] flex-1 flex-col border-t border-zinc-100 p-2 sm:min-h-[min(56vh,480px)] sm:p-3">
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-3 py-2">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                        Body
                      </span>
                      <span className="ml-auto rounded-md bg-zinc-200/70 px-2 py-0.5 text-[10px] tabular-nums text-zinc-600">
                        Rich text
                      </span>
                    </div>
                    <div className="min-h-[280px] flex-1 overflow-y-auto text-zinc-900">
                      <TiptapEditor
                        content={formData.content}
                        onChange={(content) => onFormDataChange({ content })}
                        onImageUpload={onImageUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </section>

          {/* Settings sidebar */}
          <aside
            className={`scrollbar-thin flex max-h-[55vh] shrink-0 flex-col gap-5 overflow-y-auto border-t border-zinc-800 bg-zinc-900/40 p-4 sm:max-h-none md:max-h-none md:w-[min(100%,360px)] md:border-l md:border-t-0 md:p-5 ${
              mobileTab === 'write' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-zinc-400">
                <MdOutlineImage className="h-4 w-4" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Featured image
                </h2>
              </div>
              <p className="mb-2 text-xs text-zinc-500">
                Cover for cards and social previews. {!isUpdateMode && <span className="text-amber-400/90">Required for new posts.</span>}
              </p>
              <div className="rounded-xl bg-zinc-950/50 p-2 ring-1 ring-zinc-800">
                <ImageUpload currentImage={previewUrl} onImageChange={handleImageChange} className="w-full" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-zinc-400">
                <MdNotes className="h-4 w-4" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Excerpt
                </h2>
              </div>
              <textarea
                value={formData.shortdescription}
                onChange={(e) => onFormDataChange({ shortdescription: e.target.value })}
                className={`${inputSurface} resize-none`}
                placeholder="One or two sentences for listings, cards, and previews…"
                rows={4}
                required
              />
              <div className="mt-1 flex justify-between text-[11px] tabular-nums text-zinc-500">
                <span>Shown in blog grid & metadata</span>
                <span className={excerptLen > EXCERPT_SOFT_MAX ? 'text-amber-400' : ''}>
                  {excerptLen}/{EXCERPT_SOFT_MAX}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-zinc-400">
                <MdOutlineSell className="h-4 w-4" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Visibility
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {BLOG_STATUSES.map((status) => {
                  const active = formData.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onFormDataChange({ status })}
                      className={`rounded-xl px-3 py-2.5 text-center text-xs font-semibold transition ring-1 ${
                        active
                          ? status === 'Published'
                            ? 'bg-emerald-950/80 text-emerald-200 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]'
                            : 'bg-amber-950/80 text-amber-200 ring-amber-500/40'
                          : 'bg-zinc-950/40 text-zinc-500 ring-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-zinc-400">
                <MdOutlineLocalOffer className="h-4 w-4" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]">Tags</h2>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyPress}
                  className={`${inputSurface} flex-1`}
                  placeholder="Type and Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="shrink-0 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 ring-1 ring-zinc-700 hover:bg-zinc-700"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-950/60 px-2.5 py-1 text-xs text-violet-200 ring-1 ring-violet-500/25"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-0.5 rounded p-0.5 text-violet-400 hover:bg-violet-900/80 hover:text-violet-100"
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-5">
              <div className="mb-3 flex items-center gap-2 text-zinc-400">
                <MdOutlineVisibility className="h-4 w-4" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Listing preview
                </h2>
              </div>
              <div className="overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-zinc-800">
                <div className="aspect-[16/9] bg-zinc-800">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[11px] text-zinc-600">
                      No cover yet
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      formData.status === 'Published'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {formData.status}
                  </span>
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100">
                    {formData.title || 'Untitled article'}
                  </p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
                    {formData.shortdescription || 'Excerpt shows here for cards and grids.'}
                  </p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto hidden border-t border-zinc-800 pt-4 md:block">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  Discard
                </button>
                <button
                  form="blog-composer-form"
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95"
                >
                  {isUpdateMode ? 'Update' : 'Publish'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogFormModal;
