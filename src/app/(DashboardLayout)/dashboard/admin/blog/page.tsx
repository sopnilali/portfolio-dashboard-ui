import ManageBlog from '@/components/DashboardLayout/Blog/ManageBlog'
import React from 'react'

export const metadata = {
  title: 'Manage Blog | Admin Dashboard',
  description: 'Manage Blog',
}

const BlogPage = () => {
  return (
    <div>
      <ManageBlog/>
    </div>
  )
}

export default BlogPage
