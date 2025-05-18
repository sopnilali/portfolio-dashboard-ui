import { useState, useEffect } from "react"
import { Experience } from "../Types/experience.type"

export const EditExperienceModal = ({
    isOpen,
    onClose,
    onEdit,
    experienceData
}: {
    isOpen: boolean
    onClose: () => void
    onEdit: (data: Experience) => void
    experienceData?: Experience
}) => {
    const [company, setCompany] = useState('')
    const [position, setPosition] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [description, setDescription] = useState('')

    // Helper to convert ISO string to yyyy-mm-dd
    const toDateInputFormat = (isoString: string) => {
        if (!isoString) return ''
        return isoString.split('T')[0]
    }

    // Set form data when experienceData changes
    useEffect(() => {
        if (experienceData) {
            setCompany(experienceData.company || '')
            setPosition(experienceData.position || '')
            setStartDate(toDateInputFormat(experienceData.startDate || ''))
            setEndDate(toDateInputFormat(experienceData.endDate || ''))
            setDescription(experienceData.description || '')
        }
    }, [experienceData])

    // Helper to convert yyyy-mm-dd to ISO string with T00:00:00.000Z
    const toISOStringWithTime = (date: string) => {
        if (!date) return ''
        // If already in ISO format, return as is
        if (date.includes('T')) return date
        return new Date(date + 'T00:00:00.000Z').toISOString()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (
            !company.trim() ||
            !position.trim() ||
            !startDate.trim() ||
            !endDate.trim() ||
            !description.trim()
        ) return

        onEdit({
            id: experienceData?.id,
            company,
            position,
            startDate: toISOStringWithTime(startDate),
            endDate: toISOStringWithTime(endDate),
            description,
        })

        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Experience</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">Company</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="e.g. Greenbyte Software"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">Position</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                            placeholder="e.g. Software Engineer"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">End Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-800 mb-1">Description</label>
                        <textarea
                            className="w-full border border-gray-300 bg-gray-50 text-gray-900 rounded px-3 py-2"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your role and achievements"
                            required
                            rows={3}
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
                            className="px-4 py-2 rounded bg-primary-600 border border-gray-400 hover:border-gray-500 text-black hover:bg-primary-700 cursor-pointer"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditExperienceModal 