import ApiSection from '@/components/DashboardLayout/Api'
import React from 'react'

export const metadata = {
  title: 'API | Admin Dashboard',
  description: 'API endpoints',
}

const ApiPage = () => {
  return (
    <div>
      <ApiSection />
    </div>
  )
}

export default ApiPage
