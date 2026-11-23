import { Experience } from "../Types/experience.type"
import ExperienceFormModal from './ExperienceFormModal'

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
}) => (
    <ExperienceFormModal
        isOpen={isOpen}
        mode="edit"
        initial={experienceData}
        onClose={onClose}
        onSubmit={onEdit}
    />
)

export default EditExperienceModal
