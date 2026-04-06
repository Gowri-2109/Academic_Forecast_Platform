import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ role, isCollapsed, toggleSidebar }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/login';
  };

  const getLinks = () => {
    const adminLinks = [
      { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
      { to: "/admin/prediction", label: "Prediction & Insights", icon: "online_prediction" },
      { to: "/admin/create-user", label: "Create User", icon: "person_add" },
      { to: "/admin/manage-subjects", label: "Manage Subjects", icon: "menu_book" },
      { to: "/admin/assign-students", label: "Assign Students", icon: "assignment_ind" },
      { to: "/admin/faculties", label: "Faculty List", icon: "groups" },
      { to: "/admin/students", label: "Students List", icon: "school" },
      { to: "/admin/issues", label: "Issue Tracker", icon: "bug_report" },
      { to: "/admin/queries", label: "Feedback Query", icon: "question_answer" },
    ];

    const facultyLinks = [
      { to: "/faculty", label: "Dashboard", icon: "dashboard", end: true },
      { to: "/faculty/students", label: "Students Detail", icon: "groups" },
      { to: "/faculty/marks", label: "Marks", icon: "grade" },
      { to: "/faculty/attendance", label: "Attendance", icon: "event_available" },
      { to: "/faculty/disciplinary", label: "Disciplinary Issues", icon: "error_outline" },
      { to: "/faculty/assignments", label: "Assignments", icon: "assignment" },
      { to: "/faculty/issues", label: "Issue Tracker", icon: "bug_report" },
      { to: "/faculty/queries", label: "Feedback & Queries", icon: "question_answer" },
      { to: "/faculty/student-queries", label: "Student Query", icon: "chat" },
      { to: "/faculty/tests", label: "Manage Tests", icon: "quiz" },
    ];

    const studentLinks = [
      { to: "/student", label: "Dashboard", icon: "dashboard", end: true },
      { to: "/student/marks", label: "Marks", icon: "grade" },
      { to: "/student/assignments", label: "Assignments", icon: "assignment" },
      { to: "/student/issues", label: "Issue Tracker", icon: "bug_report" },
      { to: "/student/prediction", label: "Prediction", icon: "online_prediction" },
      { to: "/student/help", label: "Feedback & Queries", icon: "help_outline" },
      { to: "/student/tests", label: "My Tests", icon: "quiz" },
    ];

    let links = [];
    switch(role?.toLowerCase()) {
      case 'admin': links = adminLinks; break;
      case 'faculty': links = facultyLinks; break;
      case 'student': links = studentLinks; break;
      default: return null;
    }

    return links.map((link) => (
      <NavLink 
        key={link.to}
        to={link.to} 
        end={link.end} 
        className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        title={isCollapsed ? link.label : ""}
      >
        <i className="material-icons">{link.icon}</i>
        {!isCollapsed && <span>{link.label}</span>}
      </NavLink>
    ));
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2 style={{color: 'var(--primary)', margin: 0}}>AF Platform</h2>}
        <button className="btn-toggle" onClick={toggleSidebar} title={isCollapsed ? "Expand" : "Collapse"}>
          <i className="material-icons">{isCollapsed ? 'menu' : 'menu_open'}</i>
        </button>
      </div>
      <div className="nav-links">
        {getLinks()}
      </div>
      <div className="sidebar-footer">
        <button 
          className="btn-theme-toggle" 
          onClick={toggleTheme}
          title={isCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : ""}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '0.5rem', background: 'var(--bg-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className="material-icons">{theme === 'light' ? 'dark_mode' : 'light_mode'}</i>
          {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>
        <button 
          className="btn-logout" 
          onClick={handleLogout} 
          title={isCollapsed ? "Logout" : ""}
          style={{ width: '100%', padding: '0.75rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className="material-icons">logout</i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
