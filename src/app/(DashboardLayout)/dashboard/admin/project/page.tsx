import ManageProject from '@/components/DashboardLayout/Project'
import React from 'react'

export const metadata = {
  title: 'Manage Project | Admin Dashboard',
  description: 'Manage Project',
}

const ManageProjectPage = () => {
  return (
    <div>
      <ManageProject />
    </div>
  )
}

export default ManageProjectPage
