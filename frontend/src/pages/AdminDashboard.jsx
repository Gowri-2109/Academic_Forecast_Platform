import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AdminOverview from './admin/AdminOverview';
import AdminPredictionInsights from './admin/AdminPredictionInsights';
import CreateUser from './admin/CreateUser';
import ManageSubjects from './admin/ManageSubjects';
import AssignStudents from './admin/AssignStudents';
import FacultyList from './admin/FacultyList';
import StudentList from './admin/StudentList';
import IssuesTracker from './admin/IssuesTracker';
import ManageTests from './shared/ManageTests';
import QueriesHub from './admin/QueriesHub';

function AdminDashboard() {
  return (
    <DashboardLayout role="Admin" title="Admin Dashboard">
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/prediction" element={<AdminPredictionInsights />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/manage-subjects" element={<ManageSubjects />} />
        <Route path="/assign-students" element={<AssignStudents />} />
        <Route path="/faculties" element={<FacultyList />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/issues" element={<IssuesTracker />} />
        <Route path="/queries" element={<QueriesHub />} />
        <Route path="/tests" element={<ManageTests />} />
      </Routes>
    </DashboardLayout>
  );
}

export default AdminDashboard;
