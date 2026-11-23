"use client"

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header';

const DashboardLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dash-shell flex h-screen overflow-hidden bg-surface-0 text-gray-200">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
