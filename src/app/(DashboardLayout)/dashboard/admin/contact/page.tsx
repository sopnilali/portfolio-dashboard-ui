import ManageContact from '@/components/DashboardLayout/Contact'
import React from 'react'

export const metadata = {
  title: 'Manage Contact | Admin Dashboard',
  description: 'Manage Contact',
}

const ContactPage = () => {
  return (
    <div>
      <ManageContact />
    </div>
  )
}

export default ContactPage
