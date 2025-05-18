"use client"

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header';

const DashboardLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  return (
    <div className="flex h-screen overflow-hidden bg-gray-800 text-gray-100">
    {/* Sidebar */}
    <Sidebar
      isOpen={isSidebarOpen}
      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    />

    {/* Mobile Overlay */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* Main content wrapper */}
    <div className="relative flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  </div>
  )
}

export default DashboardLayout
