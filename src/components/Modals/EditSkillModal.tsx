import { toast } from "sonner"
import { Skill } from "../Types/skill.type"
import SkillFormModal from './SkillFormModal'

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
    if (!isOpen || !skill) return null

    return (
        <SkillFormModal
            isOpen={isOpen}
            mode="edit"
            initialName={skill.name}
            currentIcon={skill.icon}
            onClose={onClose}
            onSubmit={({ name, file }) => {
                if (!skill.id) {
                    toast.error('Skill ID is missing')
                    return
                }
                const formData = new FormData()
                formData.append('data', JSON.stringify({ id: skill.id, name }))
                if (file) {
                    formData.append('file', file)
                }
                onEdit({ id: skill.id, data: formData })
                onClose()
            }}
        />
    )
}
