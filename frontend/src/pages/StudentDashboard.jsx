import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StudentOverview from './student/StudentOverview';
import StudentMarks from './student/StudentMarks';
import StudentAssignments from './student/StudentAssignments';
import StudentIssueTracker from './student/StudentIssueTracker';
import StudentPrediction from './student/StudentPrediction';
import StudentTests from './student/StudentTests';
import HelpDesk from './shared/HelpDesk';

function StudentDashboard() {
  return (
    <DashboardLayout role="Student" title="Student Dashboard">
      <Routes>
        <Route path="/" element={<StudentOverview />} />
        <Route path="/marks" element={<StudentMarks />} />
        <Route path="/assignments" element={<StudentAssignments />} />
        <Route path="/issues" element={<StudentIssueTracker />} />
        <Route path="/prediction" element={<StudentPrediction />} />
        <Route path="/tests" element={<StudentTests />} />
        <Route path="/help" element={<HelpDesk />} />
      </Routes>
    </DashboardLayout>
  );
}

export default StudentDashboard;
