import DashboardStats from '@/components/DashboardLayout/Stats/DashboardStats'
import React from 'react'

export const metadata = {
  title: 'Overview | Admin Dashboard',
  description: 'Overview of the dashboard',
}

const DashboardPage = () => {
  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <DashboardStats />
    </div>
  )
}

export default DashboardPage
