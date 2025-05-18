import { useState } from "react"

export const AddToSkillModal = ({
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
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Add Skill</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">Skill Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. JavaScript"
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
                            required
                        />
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
                            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 hover:border-gray-500 text-white hover:bg-primary-700 cursor-pointer"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}