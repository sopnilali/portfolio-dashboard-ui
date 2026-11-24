'use client'

import React, { useMemo, useState } from 'react'
import {
  useAddMenuMutation,
  useDeleteMenuMutation,
  useGetAllMenusAdminQuery,
  useUpdateMenuMutation,
} from '@/components/Redux/features/menu/menuApi'
import { parseSiteMenuItem, type SiteMenuFormPayload, type SiteMenuItem } from '@/components/Types/menu.type'
import { normalizeList } from '@/components/Utils/normalizeArray'
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import { MdAdd, MdDelete, MdEdit, MdMenu, MdOpenInNew } from 'react-icons/md'
import MenuFormModal from '@/components/Modals/MenuFormModal'
import DeleteMenuModal from '@/components/Modals/DeleteMenuModal'

const emptyForm: SiteMenuFormPayload = {
  label: '',
  path: '/',
  order: 0,
  isActive: true,
  isExternal: false,
}

const COLS = 5

const ManageMenu = () => {
  const { data, isLoading, refetch } = useGetAllMenusAdminQuery(undefined)
  const [addMenu] = useAddMenuMutation()
  const [updateMenu] = useUpdateMenuMutation()
  const [deleteMenu] = useDeleteMenuMutation()

  const menulist = useMemo(() => {
    const payload = data?.data !== undefined ? data.data : data
    const raw = normalizeList<unknown>(payload)
    const items = raw.map(parseSiteMenuItem).filter((x): x is SiteMenuItem => x !== null)
    return [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  }, [data])

  const [formOpen, setFormOpen] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [formData, setFormData] = useState<SiteMenuFormPayload>(emptyForm)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: '' })

  const resetForm = () => {
    setFormData(emptyForm)
    setIsUpdateMode(false)
    setSelectedId('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleEdit = (item: SiteMenuItem) => {
    setSelectedId(item.id)
    setFormData({
      label: item.label ?? '',
      path: item.path ?? '',
      order: typeof item.order === 'number' ? item.order : 0,
      isActive: Boolean(item.isActive ?? true),
      isExternal: Boolean(item.isExternal ?? false),
    })
    setIsUpdateMode(true)
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.label.trim() || !formData.path.trim()) {
      toast.error('Label and path are required')
      return
    }

    let toastId: string | number | undefined
    try {
      const payload: SiteMenuFormPayload = {
        label: formData.label.trim(),
        path: formData.path.trim(),
        order: Number.isFinite(formData.order) ? formData.order : 0,
        isActive: formData.isActive,
        isExternal: formData.isExternal,
      }

      if (isUpdateMode && selectedId) {
        toastId = toast.loading('Updating menu...')
        await updateMenu({ id: selectedId, data: payload }).unwrap()
        toast.success('Menu item updated', { id: toastId })
      } else {
        toastId = toast.loading('Adding menu item...')
        await addMenu(payload).unwrap()
        toast.success('Menu item added', { id: toastId })
      }

      setFormOpen(false)
      resetForm()
      refetch()
    } catch (error: unknown) {
      toast.error(
        getRtkQueryErrorMessage(error, isUpdateMode ? 'Update failed' : 'Add failed'),
        { id: toastId },
      )
    }
  }

  const handleToggleActive = async (item: SiteMenuItem) => {
    try {
      await updateMenu({ id: item.id, data: { isActive: !item.isActive } }).unwrap()
      toast.success(item.isActive ? `"${item.label}" hidden` : `"${item.label}" is now visible`)
      refetch()
    } catch (error: unknown) {
      toast.error(getRtkQueryErrorMessage(error, 'Could not change visibility'))
    }
  }

  const handleDelete = async (id: string) => {
    const toastId = toast.loading('Deleting...')
    try {
      await deleteMenu(id).unwrap()
      toast.success('Menu item deleted', { id: toastId })
      setDeleteModal({ open: false, id: '' })
      refetch()
    } catch (error: unknown) {
      toast.error(getRtkQueryErrorMessage(error, 'Delete failed'), { id: toastId })
    }
  }

  const closeModal = () => {
    setFormOpen(false)
    resetForm()
  }

  return (
    <motion.div
      className="mx-auto space-y-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-gray-100">Menu</h1>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] tabular-nums text-gray-400 ring-1 ring-line">
            {menulist.length}
          </span>
          <span className="hidden text-[12px] text-gray-500 sm:inline">Your site navigation links, in display order.</span>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-[13px] font-medium text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"
        >
          <MdAdd className="h-4 w-4" /> Add item
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-160 table-fixed">
          <colgroup>
            <col className="w-16" />
            <col className="w-56" />
            <col />
            <col className="w-28" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr>
              <th className="text-center">Order</th>
              <th className="text-left">Label</th>
              <th className="text-left">Path</th>
              <th className="text-left">Visible</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {isLoading ? (
                <tr>
                  <td colSpan={COLS}>
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : menulist.length ? (
                menulist.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={item.isActive ? '' : 'opacity-60'}
                  >
                    <td className="text-center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-white/5 px-1.5 text-[12px] font-medium tabular-nums text-gray-300 ring-1 ring-line">
                        {item.order ?? 0}
                      </span>
                    </td>

                    <td>
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-gray-100" title={item.label}>
                        <span className="truncate">{item.label}</span>
                        {item.isExternal && <MdOpenInNew className="h-3.5 w-3.5 shrink-0 text-gray-500" />}
                      </span>
                    </td>

                    <td>
                      <span
                        className="block truncate font-mono text-[12px] text-indigo-300"
                        title={item.path}
                      >
                        {item.path}
                      </span>
                      <span className="text-[11px] text-gray-600">{item.isExternal ? 'External link' : 'Internal page'}</span>
                    </td>

                    <td>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.isActive}
                        aria-label={`${item.isActive ? 'Hide' : 'Show'} ${item.label}`}
                        onClick={() => handleToggleActive(item)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          item.isActive ? 'bg-emerald-500' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            item.isActive ? 'translate-x-4' : ''
                          }`}
                        />
                      </button>
                    </td>

                    <td>
                      <div className="flex justify-end gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          aria-label={`Edit ${item.label}`}
                          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-indigo-300"
                        >
                          <MdEdit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ open: true, id: item.id })}
                          title="Delete"
                          aria-label={`Delete ${item.label}`}
                          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/8 hover:text-rose-300"
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={COLS}>
                    <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                      <MdMenu className="h-7 w-7 text-gray-600" />
                      <p className="text-[13px] font-medium text-gray-300">No menu items yet</p>
                      <p className="text-[12px] text-gray-500">Add links to build your site navigation.</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <MenuFormModal
        isOpen={formOpen}
        isUpdateMode={isUpdateMode}
        formData={formData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onChange={(partial) =>
          setFormData((prev) => ({
            ...prev,
            ...partial,
          }))
        }
      />

      <DeleteMenuModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: '' })}
        onDelete={handleDelete}
        menuId={deleteModal.id}
      />
    </motion.div>
  )
}

export default ManageMenu
