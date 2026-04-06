import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './FacultyViews.css'; // Let's reuse styled classes where possible or stick to simple ones

function ManageMarks() {
    const [activeTab, setActiveTab] = useState('exam');
    const [subjects, setSubjects] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    
    // Exam Marks State
    const [examSubject, setExamSubject] = useState('');
    const [examMarksData, setExamMarksData] = useState({}); // { student_id: mark }
    
    // Assignment Marks State
    const [assignments, setAssignments] = useState([]);
    const [assignSubject, setAssignSubject] = useState(''); // Holds assignment ID actually
    const [submittedAssignments, setSubmittedAssignments] = useState([]); // List of students who submitted
    const [assignMarksData, setAssignMarksData] = useState({}); // { student_id: score }

    const [loading, setLoading] = useState(false);

    const facultyId = localStorage.getItem('userId');

    useEffect(() => {
        // Fetch Subjects for Exams
        api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
        
        if (facultyId) {
            // Fetch all assigned students for Exam marks mapping
            api.get(`/faculties/${facultyId}/students`).then(res => setAssignedStudents(res.data)).catch(console.error);
            // Fetch faculty-created assignments for Assignment marks mapping
            api.get(`/faculty-assignments/faculty/${facultyId}`).then(res => setAssignments(res.data)).catch(console.error);
        }
    }, [facultyId]);

    // Fetch submitted assignments when Assign tab assignment changes
    useEffect(() => {
        if (activeTab === 'assignment' && assignSubject) {
            api.get(`/faculty-assignments/${assignSubject}/status`)
               .then(res => {
                   // We only map students who actually submitted it
                   const submitted = res.data.filter(s => s.status === 'Submitted');
                   setSubmittedAssignments(submitted);
                   
                   // Prep pre-filled scores
                   const prepData = {};
                   submitted.forEach(sub => {
                       prepData[sub.student_id] = sub.score !== null ? sub.score : '';
                   });
                   setAssignMarksData(prepData);
               })
               .catch(err => toast.error('Failed to load submissions for this assignment'));
        }
    }, [activeTab, assignSubject]);

    const handleExamSubmit = async (e) => {
        e.preventDefault();
        if (!examSubject) return toast.error('Please select a subject.');

        const payload = assignedStudents
            .filter(s => examMarksData[s.id] !== undefined && examMarksData[s.id] !== '')
            .map(s => ({
                student_id: s.id,
                subject_id: examSubject,
                internal_mark: Number(examMarksData[s.id])
            }));

        if (!payload.length) return toast.error('No marks entered!');
        
        setLoading(true);
        try {
            await api.post('/marks/bulk', { marks: payload });
            toast.success(`Successfully saved marks for ${payload.length} student(s)!`);
            setExamMarksData({}); // Clear inputs on success or keep them
        } catch (err) {
            toast.error('Error saving exam marks');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!assignSubject) return toast.error('Please select an assignment subject.');

        const payload = submittedAssignments
            .filter(sub => assignMarksData[sub.student_id] !== undefined && assignMarksData[sub.student_id] !== '')
            .map(sub => ({
                assignment_id: assignSubject,
                student_id: sub.student_id,
                score: Number(assignMarksData[sub.student_id])
            }));

        if (!payload.length) return toast.error('No assignment scores entered!');

        setLoading(true);
        try {
            await api.put('/faculty-assignments/bulk-scores', { scores: payload });
            toast.success(`Successfully saved assignment scores for ${payload.length} student(s)!`);
        } catch (err) {
            toast.error('Error saving assignment scores');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', padding: '25px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Manage Marks</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className={`btn ${activeTab === 'exam' ? 'btn-primary' : 'btn-secondary'}`} 
                        onClick={() => setActiveTab('exam')}
                    >Exam Marks</button>
                    <button 
                        className={`btn ${activeTab === 'assignment' ? 'btn-primary' : 'btn-secondary'}`} 
                        onClick={() => setActiveTab('assignment')}
                    >Assignment Marks</button>
                </div>
            </div>

            {activeTab === 'exam' && (
                <div className="exam-marks-section">
                    <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Bulk assign internal exam marks for all your assigned students.</p>
                    <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Subject *</label>
                        <select 
                            className="form-control" 
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }}
                            value={examSubject} 
                            onChange={(e) => setExamSubject(e.target.value)}
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.subject_name}</option>)}
                        </select>
                    </div>

                    {examSubject && (
                        <form onSubmit={handleExamSubmit}>
                            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="data-table">
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--table-header-bg)' }}>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Register Number</th>
                                            <th>Internal Mark (Out of 100)</th>
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
                                                        placeholder="Enter Mark"
                                                        min="0" max="100"
                                                        value={examMarksData[s.id] !== undefined ? examMarksData[s.id] : ''}
                                                        onChange={(e) => setExamMarksData({...examMarksData, [s.id]: e.target.value})}
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
                                    {loading ? 'Saving All...' : 'Save Exam Marks'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {activeTab === 'assignment' && (
                <div className="assignment-marks-section">
                    <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>Evaluate assignments. Only assigned students who submitted are listed below.</p>
                    <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Assignment Subject Title *</label>
                        <select 
                            className="form-control" 
                            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }}
                            value={assignSubject} 
                            onChange={(e) => setAssignSubject(e.target.value)}
                        >
                            <option value="">-- Select Created Assignment --</option>
                            {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                        </select>
                    </div>

                    {assignSubject && (
                        <form onSubmit={handleAssignSubmit}>
                            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="data-table">
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--table-header-bg)' }}>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Register Number</th>
                                            <th>Submission Status</th>
                                            <th>Score (Out of 100)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submittedAssignments.map(sub => (
                                            <tr key={sub.student_id}>
                                                <td><strong>{sub.student_name}</strong></td>
                                                <td>{sub.register_number}</td>
                                                <td><span style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ Submitted</span></td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        className="form-control"
                                                        style={{ maxWidth: '150px', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }}
                                                        placeholder="Enter Score"
                                                        min="0" max="100"
                                                        value={assignMarksData[sub.student_id] !== undefined ? assignMarksData[sub.student_id] : ''}
                                                        onChange={(e) => setAssignMarksData({...assignMarksData, [sub.student_id]: e.target.value})}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        {submittedAssignments.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding: '30px', color: 'var(--text-muted)'}}>No students have submitted this assignment yet. (Ensure database contains 'Submitted' records).</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 30px', fontSize: '1.1rem' }}>
                                    {loading ? 'Saving All...' : 'Save Assignment Scores'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}

export default ManageMarks;
