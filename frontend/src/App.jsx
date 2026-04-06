import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const userRole = localStorage.getItem('role');
  const roleStr = String(userRole).toLowerCase();

  const getDashboardRoute = () => {
    if (roleStr === 'admin') return '/admin';
    if (roleStr === 'faculty') return '/faculty';
    if (roleStr === 'student') return '/student';
    return '/login';
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={getDashboardRoute()} />} />
          <Route path="/login" element={roleStr === 'admin' || roleStr === 'faculty' || roleStr === 'student' ? <Navigate to={getDashboardRoute()} /> : <Login />} />
          
          {/* Simple mock protected routes. In a real app, use PrivateRoute wrappers */}
          <Route 
            path="/admin/*" 
            element={String(userRole).toLowerCase() === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/faculty/*" 
            element={String(userRole).toLowerCase() === 'faculty' ? <FacultyDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/student/*" 
            element={String(userRole).toLowerCase() === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
