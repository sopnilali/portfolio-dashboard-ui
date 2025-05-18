"use client"

import { useAddSkillMutation, useDeleteSkillMutation, useGetAllSkillsQuery, useUpdateSkillMutation } from '@/components/Redux/features/skill/skillApi'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface Skill {
  name: string
  icon: string
  id?: string
}


// Add Skill Modal
const AddToSkillModal = ({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (formData: FormData) => void
}) => {
  const [name, setName] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !iconFile) return

    const formData = new FormData()
    formData.append('data', JSON.stringify({ name }))
    formData.append('file', iconFile)

    onAdd(formData)
    setName('')
    setIconFile(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-100">Add Skill</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-200 mb-1">Skill Name</label>
            <input
              type="text"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. JavaScript"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-200 mb-1">Icon File</label>
            <input
              type="file"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setIconFile(e.target.files[0])
                } else {
                  setIconFile(null)
                }
              }}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-700 text-gray-100 hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Skill Modal
const EditSkillModal = ({
  isOpen,
  onClose,
  skill,
  onEdit,
}: {
  isOpen: boolean
  onClose: () => void
  skill: Skill | null
  onEdit: (formData: { id: string, data: FormData }) => void
}) => {
  const [name, setName] = useState(skill?.name || '')
  const [iconFile, setIconFile] = useState<File | null>(null)

  React.useEffect(() => {
    setName(skill?.name || '')
    setIconFile(null)
  }, [skill, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || (!iconFile && !skill?.icon)) return

    if (!skill?.id) {
      toast.error('Skill ID is missing')
      return
    }

    const formData = new FormData()
    formData.append(
      'data',
      JSON.stringify({ id: skill.id, name })
    )
    if (iconFile) {
      formData.append('file', iconFile)
    }
    onEdit({ id: skill.id, data: formData })
    setName('')
    setIconFile(null)
    onClose()
  }

  if (!isOpen || !skill) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-100">Edit Skill</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-200 mb-1">Skill Name</label>
            <input
              type="text"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-200 mb-1">Icon File</label>
            <input
              type="file"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setIconFile(e.target.files[0])
                } else {
                  setIconFile(null)
                }
              }}
            />
            {skill.icon && !iconFile && (
              <div className="mt-2 text-gray-400 text-xs">
                Current: <img src={skill.icon} alt="Current Icon" className="inline h-6 align-middle" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-700 text-gray-100 hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Skill Modal
const DeleteSkillModal = ({
  isOpen,
  onClose,
  onDelete,
  skill,
}: {
  isOpen: boolean
  onClose: () => void
  onDelete: (skillId: string) => void
  skill: Skill | null
}) => {
  if (!isOpen || !skill) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-100">Delete Skill</h2>
        <p className="mb-6 text-gray-200">
          Are you sure you want to delete <span className="font-semibold">{skill.name}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-700 text-gray-100 hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              if (skill.id) onDelete(skill.id)
              onClose()
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const ManageSkill = () => {
  const { data: skilldata, isLoading, refetch } = useGetAllSkillsQuery(undefined)
  const [skills, setSkills] = useState<Skill[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editSkill, setEditSkill] = useState<Skill | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteSkill, setDeleteSkill] = useState<Skill | null>(null)
  const [addSkill] = useAddSkillMutation()
  const [updateSkill] = useUpdateSkillMutation()

  // Update skills when API data changes
  React.useEffect(() => {
    if (skilldata?.data) {
      setSkills(skilldata.data)
    }
  }, [skilldata])

  console.log(skills)

  const handleAddSkill = async (formData: FormData) => {
    try {
      const result = await addSkill(formData).unwrap()
      if (result.data) {
        setSkills(prev => [...prev, result.data])
      }
    } catch (error) {
      toast.error('Failed to add skill')
    }
  }

  const handleEditSkill = async (formData: { id: string, data: FormData }) => {
    try {
      const result = await updateSkill(formData).unwrap();
      if (result.data) {
        setSkills(prev =>
          prev.map(skill =>
            skill.id === formData.id ? { ...skill, ...result.data } : skill
          )
        );
      }
      toast.success('Skill updated');
    } catch (error) {
      toast.error('Failed to update skill');
    }
  }

  const [deleteSkillMutation] = useDeleteSkillMutation();

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await deleteSkillMutation(skillId).unwrap();
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      toast.success('Skill deleted');
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  }

  return (
    <div className="max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Skills</h1>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
        >
          + Add Skill
        </button>
      </div>
      <div className="overflow-x-auto rounded">
        <table className="min-w-full bg-gray-800 rounded-lg shadow-lg">
          <thead className="bg-gray-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Icon</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-300 divide-y divide-gray-600">
            {skills.map((skill, idx) => (
              <tr key={skill.id || idx} className="hover:bg-gray-100 duration-500 transition-all">
                <td className="px-6 py-4 whitespace-nowrap tracking-wider">
                  <div className="w-12 h-12 relative flex items-center">
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="object-contain w-10 h-10 rounded"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tracking-wider">
                  {skill.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 tracking-wider">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                    title="Edit"
                    onClick={() => {
                      setEditSkill(skill)
                      setEditModalOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                    onClick={() => {
                      setDeleteSkill(skill)
                      setDeleteModalOpen(true)
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddToSkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSkill}
      />
      <EditSkillModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        skill={editSkill}
        onEdit={handleEditSkill}
      />
      <DeleteSkillModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDeleteSkill}
        skill={deleteSkill}
      />
    </div>
  )
}

export default ManageSkill
