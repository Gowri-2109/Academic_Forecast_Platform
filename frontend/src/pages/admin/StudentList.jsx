import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminLists.css';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement, PointElement, LineElement);




const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editingStudent, setEditingStudent] = useState({ id: null, name: '', register_number: '', department: '', semester: '', previousGPA: '', faculty_id: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/students');
            setStudents(res.data);
            setLoading(false);
        } catch (e) {
            toast.error('Failed to load students');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);




    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this student?')) {
            try {
                await api.delete(`/students/${id}`);
                toast.success('Student removed successfully');
                fetchData();
            } catch (e) {
                toast.error('Failed to delete student');
            }
        }
    };

    const handleViewDetails = async (student) => {
        setSelectedStudent(student);
        try {
            // Fetch multiple things: Marks, Attendance, Disciplinary, and latest Prediction
            const [marksRes, attRes, discRes, predRes, trendRes] = await Promise.allSettled([
                api.get(`/marks/${student.id}`),
                api.get(`/attendance/${student.id}`),
                api.get(`/disciplinary/${student.id}`),
                api.get(`/predict/${student.id}`),
                api.get(`/students/${student.id}/performance-trend`)
            ]);

            setStudentDetails({
                marks: marksRes.status === 'fulfilled' ? marksRes.value.data : [],
                attendance: attRes.status === 'fulfilled' ? attRes.value.data : [],
                disciplinary: discRes.status === 'fulfilled' ? discRes.value.data : [],
                prediction: predRes.status === 'fulfilled' ? predRes.value.data : null,
                trend: trendRes.status === 'fulfilled' ? trendRes.value.data : []
            });
        } catch (e) {
            toast.error('Failed to load full student details');
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent({
            id: student.id,
            name: student.name,
            register_number: student.register_number,
            department: student.department || '',
            semester: student.semester || student.year || '', // map year if semester is missing
            previousGPA: student.previousGPA || ''
        });
        setIsEditing(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/students/${editingStudent.id}`, editingStudent);
            toast.success('Student details updated successfully');
            setIsEditing(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to update student');
        }
    };

    // Helper map to augment student with their assigned faculty
    const getStudentFaculty = (student) => {
        return student.faculty_name || 'Unassigned';
    };

    return (
        <div className="admin-list-page fade-in">
            <div className="page-header">
                <h2>Students Management</h2>
            </div>


            {loading ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p style={{color: 'var(--text-muted)'}}>Updating student records...</p>
                </div>

            ) : (
                <div className="table-wrapper" style={{background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Reg No</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Assigned Faculty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* List sorted by register number as provided by backend, or explicitly sorting it here */}
                            {[...students].sort((a,b) => a.register_number.localeCompare(b.register_number)).map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.register_number}</strong></td>
                                    <td>{s.name}</td>
                                    <td>{s.department || 'N/A'} - Yr {s.year || 'N/A'}</td>
                                    <td><span className={`badge ${getStudentFaculty(s) === 'Unassigned' ? 'warning' : 'info'}`}>{getStudentFaculty(s)}</span></td>
                                    <td className="actions-cell">
                                        <button className="btn-icon view" onClick={() => handleViewDetails(s)} title="View Details">👁️ View</button>
                                        <button className="btn-icon edit" onClick={() => handleEditClick(s)} title="Edit" style={{border: 'none', background: 'none', cursor: 'pointer', margin: '0 5px', color: '#1976d2'}}>✏️ Edit</button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(s.id)} title="Remove">🗑️ Remove</button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && <tr><td colSpan="5" className="text-center">No students found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedStudent && studentDetails && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>Student Profile: {selectedStudent.name} ({selectedStudent.register_number})</h3>
                            <button className="close-btn" onClick={() => setSelectedStudent(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="profile-info-grid">
                                <div><strong>Email:</strong> {selectedStudent.email || 'N/A'}</div>
                                <div><strong>Department:</strong> {selectedStudent.department} (Year {selectedStudent.year})</div>
                                <div><strong>Previous GPA:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedStudent.previousGPA || 'N/A'}</span></div>
                                <div><strong>DOB:</strong> {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A'}</div>
                                <div><strong>Assigned Faculty:</strong> {getStudentFaculty(selectedStudent)}</div>
                            </div>
                            
                            <div className="split-view mt-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Latest Risk Prediction</h4>
                                    {studentDetails.prediction && !studentDetails.prediction.error ? (
                                        <>
                                        <div style={{height: '200px', marginBottom: '1.5rem'}}>
                                            <Doughnut 
                                                data={{
                                                    labels: ['Risk Impact', 'Safety Margin'],
                                                    datasets: [{
                                                        data: [
                                                            studentDetails.prediction.risk_level.includes('High') ? 85 : (studentDetails.prediction.risk_level.includes('Risk') ? 55 : 15), 
                                                            100 - (studentDetails.prediction.risk_level.includes('High') ? 85 : (studentDetails.prediction.risk_level.includes('Risk') ? 55 : 15))
                                                        ],
                                                        backgroundColor: [
                                                            studentDetails.prediction.risk_level.includes('High') ? 'var(--risk-high)' : (studentDetails.prediction.risk_level.includes('Risk') ? 'var(--risk-medium)' : 'var(--risk-low)'),
                                                            'rgba(59, 130, 246, 0.2)'
                                                        ],
                                                        borderWidth: 0,
                                                    }]
                                                }} 
                                                options={{ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: `Performance: ${studentDetails.prediction.performance_level} | Risk: ${studentDetails.prediction.risk_level}`, padding: {bottom: 10} } } }}
                                            />
                                        </div>
                                        <div className="risk-analysis-section" style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <h5 style={{ margin: '0 0 0.5rem 0' }}>Risk Analysis</h5>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span><strong>Level:</strong> <span style={{ color: studentDetails.prediction.risk_level.includes('High') ? 'var(--risk-high)' : (studentDetails.prediction.risk_level.includes('Risk') ? 'var(--risk-medium)' : 'var(--risk-low)'), fontWeight: 'bold' }}>{studentDetails.prediction.risk_level}</span></span>
                                                <span><strong>Score:</strong> {studentDetails.prediction.risk_level.includes('High') ? '85%' : (studentDetails.prediction.risk_level.includes('Risk') ? '55%' : '15%')}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                                <strong>Reason:</strong> {studentDetails.prediction.reason || (studentDetails.prediction.risk_level.includes('High') ? "Critical markers detected in attendance, missing assignments, or multiple disciplinary events." : (studentDetails.prediction.risk_level.includes('Risk') ? "Borderline attendance or dropping internal marks identified." : "Consistent academic and attendance performance."))}
                                            </p>
                                        </div>
                                        <div className="ai-suggestions-box" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #2196F3', padding: '1rem', borderRadius: '4px' }}>
                                            <h5 style={{ margin: '0 0 0.5rem 0', color: '#1976D2' }}>✨ AI Suggestions</h5>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                                {studentDetails.prediction.suggestions || (studentDetails.prediction.risk_level.includes('High') 
                                                    ? "Immediate intervention needed. Meet with the assigned faculty immediately. Prioritize minimum attendance bounds and clear any pending assignments." 
                                                    : (studentDetails.prediction.risk_level.includes('Risk') 
                                                        ? "Focus on improving attendance stability and request extra study material for weaker subjects from the faculty." 
                                                        : "Maintain current trajectory. Explore advanced topics or group leadership in upcoming assignments."))}
                                            </p>
                                        </div>
                                        </>
                                    ) : <p className="text-muted">No prediction available.</p>}
                                </div>
                                <div>
                                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Attendance overview</h4>
                                    {studentDetails.attendance.length > 0 ? (
                                        <div style={{height: '200px', marginBottom: '2rem'}}>
                                            <Bar 
                                                data={{
                                                    labels: studentDetails.attendance.map(a => a.subject_name.substring(0, 15) + '...'),
                                                    datasets: [{
                                                        label: 'Attendance %',
                                                        data: studentDetails.attendance.map(a => ((a.classes_attended/a.total_classes)*100).toFixed(0)),
                                                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                                        borderColor: 'rgba(54, 162, 235, 1)',
                                                        borderWidth: 1
                                                    }]
                                                }}
                                                options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }}
                                            />
                                        </div>
                                    ) : <p className="text-muted">No attendance data.</p>}

                                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Performance Trend</h4>
                                    {studentDetails.trend && studentDetails.trend.length > 0 ? (
                                        <div style={{ height: '200px' }}>
                                            <Line 
                                                data={{
                                                    labels: studentDetails.trend.map(t => `Sem ${t.semester}`),
                                                    datasets: [{
                                                        label: 'GPA Progression',
                                                        data: studentDetails.trend.map(t => parseFloat(t.gpa)),
                                                        borderColor: '#9C27B0',
                                                        backgroundColor: 'rgba(156, 39, 176, 0.2)',
                                                        fill: true,
                                                        tension: 0.3
                                                    }]
                                                }}
                                                options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, min: 4.0, max: 10.0 } } }}
                                            />
                                        </div>
                                    ) : <p className="text-muted">No historical trend data recorded.</p>}
                                </div>
                            </div>

                            <div className="mt-3">
                                <h4>Disciplinary Records</h4>
                                    {studentDetails.disciplinary.length > 0 ? (
                                        <ul className="disc-list">
                                            {studentDetails.disciplinary.map(d => (
                                                <li key={d.id}><strong>{d.date_reported ? new Date(d.date_reported).toLocaleDateString() : new Date().toLocaleDateString()}:</strong> {d.description} <span className="text-muted">({d.status || d.action_taken || 'Pending action'})</span></li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-success">Clean record.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Edit Student Details</h3>
                            <button className="close-btn" onClick={() => setIsEditing(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEditSave} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Name</label>
                                    <input type="text" value={editingStudent.name} onChange={e=>setEditingStudent({...editingStudent, name: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Register Number</label>
                                    <input type="text" value={editingStudent.register_number} onChange={e=>setEditingStudent({...editingStudent, register_number: e.target.value})} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Department</label>
                                    <input type="text" value={editingStudent.department} onChange={e=>setEditingStudent({...editingStudent, department: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Semester</label>
                                    <input type="number" value={editingStudent.semester} onChange={e=>setEditingStudent({...editingStudent, semester: parseInt(e.target.value) || ''})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Previous GPA</label>
                                    <input type="number" step="0.01" value={editingStudent.previousGPA} onChange={e=>setEditingStudent({...editingStudent, previousGPA: parseFloat(e.target.value) || ''})} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}} />
                                </div>
                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentList;
