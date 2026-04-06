import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminLists.css';

// Chart components if we want to show charts inside the modal
import { Pie } from 'react-chartjs-2';

const FacultyList = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [facultyStudents, setFacultyStudents] = useState([]);
    const [studentRisks, setStudentRisks] = useState([]);
    const [isEditingFaculty, setIsEditingFaculty] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    const fetchFaculties = async () => {
        try {
            const res = await api.get('/faculties');
            setFaculties(res.data);
            setLoading(false);
        } catch (e) {
            toast.error('Failed to load faculties');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this faculty? This action cannot be undone.')) {
            try {
                await api.delete(`/faculties/${id}`);
                toast.success('Faculty removed successfully');
                fetchFaculties();
            } catch (e) {
                toast.error('Failed to delete faculty');
            }
        }
    };

    const handleViewDetails = async (faculty) => {
        setIsEditingFaculty(false);
        setSelectedFaculty(faculty);
        try {
            // Fetch students assigned to this faculty
            const assignRes = await api.get(`/student-assignments/faculty/${faculty.user_id}`);
            let students = assignRes.data;
            
            // To get risk charts for this specific faculty's students
            const riskCounts = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
            let totalGpa = 0;
            let validGpaCount = 0;
            
            for (let i = 0; i < students.length; i++) {
                let s = students[i];
                try {
                    const predRes = await api.get(`/predict/${s.student_id}`);
                    const risk = predRes.data.risk_level;
                    if (risk.includes('Low') || risk === 'None') riskCounts['Low Risk']++;
                    else if (risk.includes('Medium') || risk.includes('Attendance')) riskCounts['Medium Risk']++;
                    else if (risk.includes('High')) riskCounts['High Risk']++;

                    // Attach the GPA and percentage to the student object
                    const gpa = parseFloat(predRes.data.predicted_gpa);
                    s.predicted_gpa = isNaN(gpa) ? 'N/A' : gpa;
                    s.overall_percentage = predRes.data.predicted_percentage || predRes.data.metrics.average_marks;
                    
                    if (!isNaN(gpa)) {
                         totalGpa += gpa;
                         validGpaCount++;
                    }
                } catch(err) {
                    s.predicted_gpa = 'N/A';
                    s.overall_percentage = 'N/A';
                }
            }
            
            setFacultyStudents(students);
            setStudentRisks(Object.keys(riskCounts).map(k => ({ risk_level: k, count: riskCounts[k] })));
            setSelectedFaculty({
                ...faculty,
                performanceSummary: {
                     highRiskCount: riskCounts['High Risk'],
                     avgGpa: validGpaCount > 0 ? (totalGpa / validGpaCount).toFixed(2) : 'N/A'
                }
            });

        } catch (e) {
            toast.error('Failed to fetch faculty details');
        }
    };

    const closeDetails = () => {
        setSelectedFaculty(null);
        setFacultyStudents([]);
        setStudentRisks([]);
        setIsEditingFaculty(false);
    };

    const handleEditClick = (faculty) => {
        setEditFormData({
            first_name: faculty.first_name || '',
            last_name: faculty.last_name || '',
            email: faculty.email || '',
            department: faculty.department || '',
            dob: faculty.dob ? new Date(faculty.dob).toISOString().split('T')[0] : '',
            age: faculty.age || '',
            address: faculty.address || ''
        });
        setSelectedFaculty(faculty);
        setIsEditingFaculty(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/faculties/${selectedFaculty.user_id}`, editFormData);
            toast.success('Faculty updated successfully');
            setIsEditingFaculty(false);
            fetchFaculties();
        } catch (err) {
            toast.error('Failed to update faculty');
        }
    };

    const riskPieConfig = {
        labels: studentRisks.map(r => r.risk_level),
        datasets: [{
            data: studentRisks.map(r => r.count),
            backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
            borderWidth: 1,
        }]
    };

    const hasRiskData = studentRisks.some(r => r.count > 0);

    if (loading) return <div style={{textAlign: 'center', padding: '50px', color: 'var(--text-muted)'}}>Retrieving faculty roster...</div>;

    return (
        <div className="admin-list-page fade-in">
            <div className="page-header">
                <h2>Faculty Management</h2>
            </div>
            
            <div className="table-responsive shadow-sm rounded">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculties.map(f => (
                                <tr key={f.user_id}>
                                    <td>
                                        <strong>{f.first_name ? `${f.first_name} ${f.last_name}` : f.name}</strong>
                                    </td>
                                    <td>{f.email}</td>
                                    <td>{f.department || 'N/A'}</td>
                                    <td className="actions-cell">
                                        <button className="btn-icon view" onClick={() => handleViewDetails(f)} title="View Details">👁️ View</button>
                                        <button className="btn-icon edit" onClick={() => handleEditClick(f)} title="Edit">✏️ Edit</button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(f.user_id)} title="Remove">🗑️ Remove</button>
                                    </td>
                                </tr>
                            ))}
                            {faculties.length === 0 && <tr><td colSpan="4" className="text-center">No faculties found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            

            {/* Modal for Faculty Details */}
            {selectedFaculty && (
                <div className="modal-overlay">
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>{isEditingFaculty ? 'Edit Faculty' : `Faculty Details: ${selectedFaculty.first_name ? `${selectedFaculty.first_name} ${selectedFaculty.last_name}` : selectedFaculty.name}`}</h3>
                            <button className="close-btn" onClick={closeDetails}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {isEditingFaculty ? (
                                <form onSubmit={handleSaveEdit} className="complex-form">
                                    <div className="form-group half">
                                        <label>First Name</label>
                                        <input type="text" value={editFormData.first_name} onChange={e => setEditFormData({...editFormData, first_name: e.target.value})} required />
                                    </div>
                                    <div className="form-group half">
                                        <label>Last Name</label>
                                        <input type="text" value={editFormData.last_name} onChange={e => setEditFormData({...editFormData, last_name: e.target.value})} required />
                                    </div>
                                    <div className="form-group half">
                                        <label>Email Address</label>
                                        <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} required />
                                    </div>
                                    <div className="form-group half">
                                        <label>Department</label>
                                        <input type="text" value={editFormData.department} onChange={e => setEditFormData({...editFormData, department: e.target.value})} required />
                                    </div>
                                    <div className="form-group half">
                                        <label>Age</label>
                                        <input type="number" value={editFormData.age} onChange={e => setEditFormData({...editFormData, age: e.target.value})} />
                                    </div>
                                    <div className="form-group half">
                                        <label>Date of Birth</label>
                                        <input type="date" value={editFormData.dob} onChange={e => setEditFormData({...editFormData, dob: e.target.value})} />
                                    </div>
                                    <div className="form-group full">
                                        <label>Address</label>
                                        <input type="text" value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} />
                                    </div>
                                    <div className="form-actions" style={{marginTop: '15px'}}>
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditingFaculty(false)} style={{marginLeft: '10px'}}>Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="profile-info-grid">
                                        <div><strong>Email:</strong> {selectedFaculty.email}</div>
                                        <div><strong>Department:</strong> {selectedFaculty.department || 'N/A'}</div>
                                        <div><strong>DOB:</strong> {selectedFaculty.dob ? new Date(selectedFaculty.dob).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong>Age:</strong> {selectedFaculty.age || 'N/A'}</div>
                                        <div className="full-width"><strong>Address:</strong> {selectedFaculty.address || 'N/A'}</div>
                                    </div>
                                    
                                    <hr />
                                    
                                    <div className="faculty-performance-summary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
                                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #2196F3', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976D2' }}>Average Student GPA</h4>
                                            <h2 style={{ fontSize: '2rem', margin: 0 }}>{selectedFaculty.performanceSummary?.avgGpa || 'N/A'}</h2>
                                        </div>
                                        <div style={{ background: 'rgba(244, 67, 54, 0.1)', border: '1px solid #F44336', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#D32F2F' }}>High-Risk Students</h4>
                                            <h2 style={{ fontSize: '2rem', margin: 0, color: '#D32F2F' }}>{selectedFaculty.performanceSummary?.highRiskCount || 0}</h2>
                                        </div>
                                    </div>
                                    
                                    <hr />
                                    
                                    <div className="faculty-students-section">
                                        <h4>Assigned Students ({facultyStudents.length})</h4>
                                        <div className="split-view">
                                            <div className="student-list-mini">
                                                {facultyStudents.length > 0 ? (
                                                    <ul>
                                                        {facultyStudents.map(s => (
                                                            <li key={s.student_id}>
                                                                {s.register_number} - {s.student_name || s.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <p>No students assigned.</p>}
                                            </div>
                                            <div className="student-chart-mini">
                                                <h5>Overall Student Risk</h5>
                                                {hasRiskData ? (
                                                    <div style={{height: '200px'}}>
                                                        <Pie data={riskPieConfig} options={{ responsive: true, maintainAspectRatio: false }} />
                                                    </div>
                                                ) : <p className="text-muted">No prediction data for these students yet.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyList;
