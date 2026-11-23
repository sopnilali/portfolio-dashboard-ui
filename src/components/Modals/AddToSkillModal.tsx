import SkillFormModal from './SkillFormModal'

export const AddToSkillModal = ({
    isOpen,
    onClose,
    onAdd,
}: {
    isOpen: boolean
    onClose: () => void
    onAdd: (formData: FormData) => void
}) => (
    <SkillFormModal
        isOpen={isOpen}
        mode="add"
        onClose={onClose}
        onSubmit={({ name, file }) => {
            if (!file) return
            const formData = new FormData()
            formData.append('data', JSON.stringify({ name }))
            formData.append('file', file)
            onAdd(formData)
            onClose()
        }}
    />
)
