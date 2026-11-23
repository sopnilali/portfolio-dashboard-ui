import { Experience } from "../Types/experience.type"
import ExperienceFormModal from './ExperienceFormModal'

export const AddtoExperienceModal = ({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: Experience) => void
}) => (
  <ExperienceFormModal isOpen={isOpen} mode="add" onClose={onClose} onSubmit={onAdd} />
)
