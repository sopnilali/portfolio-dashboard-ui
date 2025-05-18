import React, { useState } from "react"
import { toast } from "sonner"
import { Skill } from "../Types/skill.type"

export const EditSkillModal = ({
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
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Skill</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">Skill Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">Icon File</label>
                        <input
                            type="file"
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
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
                            <div className="mt-2 text-gray-600 text-xs">
                                Current: <img src={skill.icon} alt="Current Icon" className="inline h-6 align-middle" />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                                          className="px-4 py-2 rounded bg-primary-600 border border-gray-400 hover:border-gray-500 text-black hover:bg-primary-700 cursor-pointer"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}