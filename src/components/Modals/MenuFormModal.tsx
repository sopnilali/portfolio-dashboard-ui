'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdMenu, MdOpenInNew } from 'react-icons/md';
import type { SiteMenuFormPayload } from '@/components/Types/menu.type';

export type MenuFormState = SiteMenuFormPayload;

interface MenuFormModalProps {
  isOpen: boolean;
  isUpdateMode: boolean;
  formData: MenuFormState;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<MenuFormState>) => void;
}

const label = 'mb-1.5 block text-[12px] font-medium text-gray-400';
const field =
  'h-9 w-full rounded-lg border border-line bg-surface-0 px-3 text-[13px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent/60';

const Toggle = ({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  hint: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface-0 px-3.5 py-2.5 text-left transition-colors hover:border-gray-600"
  >
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-medium text-gray-200">{title}</span>
      <span className="block text-[11px] text-gray-500">{hint}</span>
    </span>
    <span
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-600'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </span>
  </button>
);

const MenuFormModal = ({
  isOpen,
  isUpdateMode,
  formData,
  onClose,
  onSubmit,
  onChange,
}: MenuFormModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const looksExternal = /^https?:\/\//i.test(formData.path.trim());

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-form-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/50"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
            <MdMenu className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="menu-form-title" className="text-[15px] font-semibold text-gray-100">
              {isUpdateMode ? 'Edit menu item' : 'New menu item'}
            </h2>
            <p className="text-[12px] text-gray-500">A link in your site navigation.</p>
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
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="menu-label" className={label}>
                  Label <span className="text-rose-400">*</span>
                </label>
                <input
                  id="menu-label"
                  type="text"
                  value={formData.label}
                  onChange={(e) => onChange({ label: e.target.value })}
                  placeholder="Home"
                  required
                  autoFocus
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="menu-order" className={label}>
                  Order
                </label>
                <input
                  id="menu-order"
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) => onChange({ order: Number.parseInt(e.target.value, 10) || 0 })}
                  className={`${field} tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="menu-path" className={label}>
                Path or URL <span className="text-rose-400">*</span>
              </label>
              <input
                id="menu-path"
                type="text"
                value={formData.path}
                onChange={(e) => onChange({ path: e.target.value })}
                placeholder="/projects or https://example.com"
                required
                className={`${field} font-mono`}
              />
              {looksExternal && !formData.isExternal && (
                <button
                  type="button"
                  onClick={() => onChange({ isExternal: true })}
                  className="mt-1.5 flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  <MdOpenInNew className="h-3.5 w-3.5" /> This looks like an external link — mark it as external
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Toggle
                checked={formData.isActive}
                onChange={(isActive) => onChange({ isActive })}
                title="Visible on site"
                hint="Hidden items stay saved but are not shown."
              />
              <Toggle
                checked={formData.isExternal}
                onChange={(isExternal) => onChange({ isExternal })}
                title="External link"
                hint="Opens in a new tab."
              />
            </div>

            <div>
              <span className={label}>Preview</span>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-0 px-3 py-1.5 text-[13px] text-gray-200">
                {formData.label.trim() || 'Label'}
                {formData.isExternal && <MdOpenInNew className="h-3.5 w-3.5 text-gray-500" />}
                {!formData.isActive && (
                  <span className="ml-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">Hidden</span>
                )}
              </div>
            </div>
          </div>

          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-surface-0/50 px-5 py-3">
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
              {isUpdateMode ? 'Save changes' : 'Add item'}
            </button>
          </footer>
        </form>
      </motion.div>
    </div>
  );
};

export default MenuFormModal;
