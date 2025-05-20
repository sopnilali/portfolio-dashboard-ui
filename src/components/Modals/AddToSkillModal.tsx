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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl border border-gray-300">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Add Skill</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1 font-medium">Skill Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-400 bg-white text-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. JavaScript"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-1 font-medium">Icon File</label>
                        <input
                            type="file"
                            className="w-full border border-gray-400 bg-white text-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
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
                            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors font-medium"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors font-medium"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}