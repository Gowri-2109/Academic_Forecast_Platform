import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const DashboardLayout = ({ children, role, title }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="app-layout">
      <Sidebar 
        role={role} 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopHeader title={title} />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
