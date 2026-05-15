'use client'

import React, { useMemo, useState } from 'react'
import {
  useAddMenuMutation,
  useDeleteMenuMutation,
  useGetAllMenusQuery,
  useUpdateMenuMutation,
} from '@/components/Redux/features/menu/menuApi'
import { parseSiteMenuItem, type SiteMenuFormPayload, type SiteMenuItem } from '@/components/Types/menu.type'
import { normalizeList } from '@/components/Utils/normalizeArray'
import { getRtkQueryErrorMessage } from '@/components/Utils/getRtkQueryErrorMessage'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/Shared/LoadingSpinner'
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md'
import MenuFormModal from '@/components/Modals/MenuFormModal'
import DeleteMenuModal from '@/components/Modals/DeleteMenuModal'

const modalMotionProps = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 },
  className: 'fixed inset-0 z-50 flex items-center justify-center',
} as const

const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
}

const tableRowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: 'easeOut' as const },
  }),
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const emptyForm: SiteMenuFormPayload = {
  label: '',
  path: '/',
  order: 0,
  isActive: true,
  isExternal: false,
}

const COLS = 6

const TH_CELL =
  'px-3 py-2.5 text-left text-[11px] font-semibold text-gray-100 uppercase tracking-wide whitespace-nowrap'
const TD_CELL = 'px-3 py-2.5 text-xs text-gray-200 align-middle'

const ManageMenu = () => {
  const { data, isLoading, refetch } = useGetAllMenusQuery(undefined)
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
    <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Manage menu</h1>
          <p className="text-sm text-gray-400 mt-1">
            Control navigation links (label, path, order, internal vs external).
          </p>
        </div>
        <motion.button
          type="button"
          onClick={handleOpenCreate}
          className="bg-slate-700/90 text-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700/80 shrink-0"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <MdAdd /> Add item
        </motion.button>
      </div>

      <div className="overflow-x-auto rounded" style={{ overflowY: 'hidden' }}>
        <motion.table
          className="w-full table-fixed border-collapse bg-gray-900 rounded-lg shadow-lg"
          variants={tableContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '36%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead className="bg-slate-700/90 text-gray-100">
            <tr>
              <th className={`${TH_CELL} text-center`}>#</th>
              <th className={TH_CELL}>Label</th>
              <th className={TH_CELL}>Path</th>
              <th className={`${TH_CELL} text-center`}>Ext.</th>
              <th className={`${TH_CELL} text-center`}>Visible</th>
              <th className={`${TH_CELL} text-right pr-4`}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={COLS}>
                    <div className="flex justify-center py-12 text-gray-400">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : menulist.length ? (
                menulist.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    className="hover:bg-gray-700/80 transition-colors"
                    variants={tableRowVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <td className={`${TD_CELL} text-center tabular-nums text-gray-300`}>{item.order ?? 0}</td>
                    <td className={`${TD_CELL} max-w-0 min-w-0`}>
                      <span className="block font-medium text-gray-100 truncate" title={item.label}>
                        {item.label}
                      </span>
                    </td>
                    <td className={`${TD_CELL} max-w-0 min-w-0 font-mono text-[11px] text-indigo-300`}>
                      <span className="block truncate" title={item.path}>
                        {item.path}
                      </span>
                    </td>
                    <td className={`${TD_CELL} text-center`}>
                      <span
                        className={`inline-flex justify-center px-2 py-0.5 rounded-full text-[11px] ${
                          item.isExternal ? 'bg-sky-900/50 text-sky-300' : 'bg-gray-600/60 text-gray-400'
                        }`}
                      >
                        {item.isExternal ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className={`${TD_CELL} text-center`}>
                      <span
                        className={`inline-flex justify-center px-2 py-0.5 rounded-full text-[11px] ${
                          item.isActive ? 'bg-emerald-900/50 text-emerald-300' : 'bg-gray-600/60 text-gray-400'
                        }`}
                      >
                        {item.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className={`${TD_CELL} whitespace-nowrap text-right pr-4`}>
                      <motion.button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="mr-2 text-indigo-400 hover:text-indigo-300 p-1 inline-flex align-middle"
                        whileHover={{ scale: 1.08 }}
                        aria-label="Edit"
                      >
                        <MdEdit className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setDeleteModal({ open: true, id: item.id })}
                        className="text-rose-400 hover:text-rose-300 p-1 inline-flex align-middle"
                        whileHover={{ scale: 1.08 }}
                        aria-label="Delete"
                      >
                        <MdDelete className="w-5 h-5" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={COLS}>
                    <div className="py-14 text-center text-gray-400 text-sm">
                      No menu items yet. Add one, or verify the API exposes{' '}
                      <code className="text-gray-500">GET /menu/all</code>.
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </motion.table>
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div {...modalMotionProps}>
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal.open && (
          <motion.div {...modalMotionProps}>
            <DeleteMenuModal
              isOpen={deleteModal.open}
              onClose={() => setDeleteModal({ open: false, id: '' })}
              onDelete={handleDelete}
              menuId={deleteModal.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ManageMenu
