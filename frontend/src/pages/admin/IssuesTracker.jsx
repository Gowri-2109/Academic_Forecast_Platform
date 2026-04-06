import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminLists.css';



const IssuesTracker = () => {
    const [issues, setIssues] = useState([]);
    const [lowAttendance, setLowAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [activeTab, setActiveTab] = useState('disciplinary');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [discRes, attRes, stuRes] = await Promise.all([
                api.get('/disciplinary'), 
                api.get('/attendance/low'),
                api.get('/students') // Get all students to map faculty info
            ]);
            
            setIssues(discRes.data);
            setLowAttendance(attRes.data);
            setAssignments(stuRes.data.filter(s => s.faculty_id));
            setLoading(false);
        } catch (e) {
            toast.error('Failed to load tracking data.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);




    const handleDeleteIssue = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/disciplinary/record/${id}`);
                toast.success('Deleted successfully');
                fetchData();
            } catch (e) {
                toast.error('Deletion failed');
            }
        }
    };

    const handleUpdateIssue = async (id, field, value) => {
        try {
            const issueToUpdate = issues.find(i => i.id === id);
            const updatedData = {
                priority: field === 'priority' ? value : (issueToUpdate.priority || 'Medium'),
                status: field === 'status' ? value : (issueToUpdate.status || 'Open')
            };
            await api.put(`/disciplinary/record/${id}`, updatedData);
            toast.success('Updated successfully');
            fetchData();
        } catch (e) {
            toast.error('Update failed');
        }
    };

    const getFacultyName = (studentId) => {
        const student = assignments.find(s => String(s.id) === String(studentId));
        return student && student.faculty_name ? student.faculty_name : 'unassigned';
    };

    return (
        <div className="admin-list-page fade-in">
            <div className="page-header">
                <h2>Issues & Attendance Tracker</h2>
            </div>
            
            <div className="type-toggle" style={{marginBottom: '20px'}}>
                <button 
                    className={activeTab === 'disciplinary' ? 'active' : ''} 
                    onClick={() => setActiveTab('disciplinary')}
                    type="button"
                >Disciplinary Alerts</button>
                <button 
                    className={activeTab === 'attendance' ? 'active' : ''} 
                    onClick={() => setActiveTab('attendance')}
                    type="button"
                >Low Attendance</button>
            </div>

            {loading ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p style={{color: 'var(--text-muted)'}}>Scanning for academic issues...</p>
                </div>

            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {activeTab === 'disciplinary' && (
                        <div className="tracker-card" style={{ overflowX: 'auto' }}>
                            <h3>Disciplinary Activities</h3>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Reg No / Dept / Yr</th>
                                            <th>Faculty</th>
                                            <th>Issue Description</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issues.map(issue => (
                                            <tr key={issue.id}>
                                                <td><strong>{issue.student_name}</strong></td>
                                                <td>{issue.register_number} | {issue.department} | {issue.year}</td>
                                                <td>{getFacultyName(issue.student_id)}</td>
                                                <td>
                                                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '4px', borderLeft: '3px solid var(--risk-high)' }}>
                                                        <span style={{color: 'var(--risk-high)', fontWeight: '500'}}>{issue.description}</span><br/>
                                                        <small className="text-muted">Reported: {new Date(issue.incident_date).toLocaleDateString()}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <select value={issue.priority || 'Medium'} onChange={(e) => handleUpdateIssue(issue.id, 'priority', e.target.value)} style={{ padding: '4px', borderRadius: '4px' }}>
                                                        <option value="High">High</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="Low">Low</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select value={issue.status || 'Open'} onChange={(e) => handleUpdateIssue(issue.id, 'status', e.target.value)} style={{ padding: '4px', borderRadius: '4px' }}>
                                                        <option value="Open">Open</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button className="btn-icon delete" onClick={() => handleDeleteIssue(issue.id)} title="Delete Issue">🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {issues.length === 0 && <tr><td colSpan="7">No disciplinary issues found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="tracker-card" style={{ overflowX: 'auto' }}>
                            <h3>Low Attendance Alerts (&lt; 60%)</h3>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Reg No / Dept</th>
                                            <th>Subject</th>
                                            <th>Attendance %</th>
                                            <th>Faculty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowAttendance.map((att, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{att.student_name}</strong></td>
                                                <td>{att.register_number} | {att.department}</td>
                                                <td>{att.subject_name}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ flex: 1, backgroundColor: '#eee', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${(att.classes_attended / att.total_classes) * 100}%`, backgroundColor: 'var(--risk-high)', height: '100%' }}></div>
                                                        </div>
                                                        <strong style={{color: 'var(--risk-high)'}}>
                                                            {((att.classes_attended / att.total_classes) * 100).toFixed(1)}%
                                                        </strong>
                                                    </div>
                                                    <small className="text-muted">({att.classes_attended} / {att.total_classes} classes)</small>
                                                </td>
                                                <td>{getFacultyName(att.student_id)}</td>
                                            </tr>
                                        ))}
                                        {lowAttendance.length === 0 && <tr><td colSpan="5">No low attendance records found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IssuesTracker;
