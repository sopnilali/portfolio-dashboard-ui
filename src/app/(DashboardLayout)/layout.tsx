
import DashboardLayout from '@/components/DashboardLayout';
import React from 'react'

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
      <div>
        <DashboardLayout children={children} />
      </div>
    );
  };
  
  export default Layout;
  