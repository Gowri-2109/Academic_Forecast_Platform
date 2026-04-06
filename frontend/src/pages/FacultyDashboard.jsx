import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import DashboardOverview from './faculty/DashboardOverview';
import StudentsDetails from './faculty/StudentsDetails';
import MarksPage from './faculty/MarksPage';
import AttendancePage from './faculty/AttendancePage';
import DisciplinePage from './faculty/DisciplinePage';
import AssignmentsPage from './faculty/AssignmentsPage';
import IssuesTracker from './faculty/IssuesTracker';
import Queries from './faculty/Queries';
import ManageTests from './shared/ManageTests';
import StudentQueries from './faculty/StudentQueries';

function FacultyDashboard() {
  return (
    <DashboardLayout role="Faculty" title="Faculty Space">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/students" element={<StudentsDetails />} />
        <Route path="/marks" element={<MarksPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/disciplinary" element={<DisciplinePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/issues" element={<IssuesTracker />} />
        <Route path="/queries" element={<Queries />} />
        <Route path="/tests" element={<ManageTests />} />
        <Route path="/student-queries" element={<StudentQueries />} />
      </Routes>
    </DashboardLayout>
  );
}

export default FacultyDashboard;
