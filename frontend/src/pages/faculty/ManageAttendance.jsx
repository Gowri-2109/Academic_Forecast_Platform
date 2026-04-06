import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

function ManageAttendance() {
    const [subjects, setSubjects] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    
    const [selectedSubject, setSelectedSubject] = useState('');
    const [attendanceData, setAttendanceData] = useState({}); // { student_id: percentage }
    const [loading, setLoading] = useState(false);
    const facultyId = localStorage.getItem('userId');

    useEffect(() => {
        api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
        if (facultyId) {
            api.get(`/faculties/${facultyId}/students`).then(res => setAssignedStudents(res.data)).catch(console.error);
        }
    }, [facultyId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSubject) return toast.error('Please select a subject.');

        const payload = assignedStudents
            .filter(s => attendanceData[s.id] !== undefined && attendanceData[s.id] !== '')
            .map(s => ({
                student_id: s.id,
                subject_id: selectedSubject,
                percentage: Number(attendanceData[s.id])
            }));

        if (!payload.length) return toast.error('No attendance data entered!');
        
        setLoading(true);
        try {
            await api.post('/attendance/bulk', { attendance: payload });
            toast.success(`Successfully recorded attendance for ${payload.length} student(s)!`);
            setAttendanceData({}); // Clear after save
        } catch (err) {
            toast.error('Error saving attendance records');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', padding: '25px', borderRadius: '12px' }}>
            <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Manage Attendance</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Record attendance percentages in bulk for your assigned students.</p>
            </div>

            <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Subject *</label>
                <select 
                    className="form-control" 
                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }}
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                >
                    <option value="">-- Choose Subject --</option>
                    {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.subject_name}</option>)}
                </select>
            </div>

            {selectedSubject && (
                <form onSubmit={handleSubmit}>
                    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table className="data-table">
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--table-header-bg)' }}>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Register Number</th>
                                    <th>Overall Attendance %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedStudents.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.name}</strong></td>
                                        <td>{s.register_number}</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                className="form-control"
                                                style={{ maxWidth: '150px', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }}
                                                placeholder="e.g. 85.5"
                                                min="0" max="100" step="0.01"
                                                value={attendanceData[s.id] !== undefined ? attendanceData[s.id] : ''}
                                                onChange={(e) => setAttendanceData({...attendanceData, [s.id]: e.target.value})}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {assignedStudents.length === 0 && <tr><td colSpan="3" style={{textAlign:'center'}}>No students currently assigned to you.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 30px', fontSize: '1.1rem' }}>
                            {loading ? 'Saving All...' : 'Save All Attendance'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ManageAttendance;
