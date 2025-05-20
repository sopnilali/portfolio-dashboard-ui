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
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-100">Edit Skill</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-200 mb-1">Skill Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-gray-500"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-200 mb-1">Icon File</label>
                        <input
                            type="file"
                            className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded px-3 py-2 focus:ring-2 focus:ring-gray-500"
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
                            className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-gray-600 text-gray-100 hover:bg-gray-500 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}