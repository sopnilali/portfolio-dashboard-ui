import ManageMenu from '@/components/DashboardLayout/Menu'
import React from 'react'

export const metadata = {
  title: 'Manage Menu | Admin Dashboard',
  description: 'Manage site navigation menu',
}

const MenuPage = () => {
  return (
    <div>
      <ManageMenu />
    </div>
  )
}

export default MenuPage
