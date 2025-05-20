import DashboardStats from '@/components/DashboardLayout/Stats/DashboardStats'
import React from 'react'

export const metadata = {
  title: 'Overview | Admin Dashboard',
  description: 'Overview of the dashboard',
}

const DashboardPage = () => {
  return (
    <div>
      <DashboardStats />
    </div>
  )
}

export default DashboardPage
