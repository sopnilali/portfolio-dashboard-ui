import ManageExperience from '@/components/DashboardLayout/Experience'
import React from 'react'

export const metadata = {
  title: 'Manage Experience | Admin Dashboard',
  description: 'Manage Experience',
}

const ExperiencePage = () => {
  return (
    <div>
      <ManageExperience />
    </div>
  )
}

export default ExperiencePage
