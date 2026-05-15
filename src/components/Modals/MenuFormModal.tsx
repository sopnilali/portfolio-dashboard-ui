import { MdClose, MdAdd, MdUpdate } from 'react-icons/md';
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

const MenuFormModal = ({
  isOpen,
  isUpdateMode,
  formData,
  onClose,
  onSubmit,
  onChange,
}: MenuFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isUpdateMode ? 'Edit menu item' : 'Add menu item'}
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
            <label className="block text-sm font-medium text-gray-800 mb-1">Label</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => onChange({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholder="e.g. Home"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Path</label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => onChange({ path: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholder="/projects or https://example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Order</label>
            <input
              type="number"
              min={0}
              value={formData.order}
              onChange={(e) => onChange({ order: Number.parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onChange({ isActive: e.target.checked })}
              className="rounded border-gray-400"
            />
            <span className="text-sm text-gray-800">Visible on site</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isExternal}
              onChange={(e) => onChange({ isExternal: e.target.checked })}
              className="rounded border-gray-400"
            />
            <span className="text-sm text-gray-800">External link (opens in new tab)</span>
          </label>

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
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium inline-flex items-center gap-1"
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

export default MenuFormModal;
