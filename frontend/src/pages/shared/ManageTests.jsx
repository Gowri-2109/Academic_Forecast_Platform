import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../faculty/FacultyViews.css';
import { toast } from 'react-toastify';

const ManageTests = () => {
    // Persistent state retrieval for robust refresh handling
    const [userId] = useState(localStorage.getItem('userId'));
    const [role] = useState(localStorage.getItem('role'));
    
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('create'); // 'create', 'pending', 'completed'
    const [gradingTest, setGradingTest] = useState(null);
    const [assignedStudents, setAssignedStudents] = useState([]);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        total_marks: '',
        test_date: '',
        duration_mins: ''
    });

    // Marks state
    const [marksData, setMarksData] = useState({});

    useEffect(() => {
        if (userId) {
            fetchCreatedTests();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const fetchCreatedTests = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tests/creator/${userId}`);
            // Ensure data persists by setting it only if valid
            if (res.data) {
                setTests(res.data);
            }
        } catch (err) {
            console.error("Fetch tests error:", err);
            toast.error("Failed to load tests. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tests', {
                ...formData,
                created_by: userId,
                role: role
            });
            toast.success("Test created and students notified!");
            setFormData({ title: '', description: '', total_marks: '', test_date: '', duration_mins: '' });
            fetchCreatedTests();
            setActiveTab('pending');
        } catch (err) {
            toast.error("Failed to create test");
        }
    };

    const startGrading = async (test) => {
        setGradingTest(test);
        try {
            const res = await api.get(`/tests/${test.id}/students`);
            setAssignedStudents(res.data);
            const initialMarks = {};
            res.data.forEach(s => {
                initialMarks[s.student_id] = s.marks_obtained !== null ? s.marks_obtained : '';
            });
            setMarksData(initialMarks);
        } catch (err) {
            toast.error("Failed to load students for grading");
        }
    };

    const handleMarkChange = (studentId, val) => {
        setMarksData(prev => ({ ...prev, [studentId]: val }));
    };

    const submitMarks = async (isFinal = false) => {
        const marksArray = Object.entries(marksData).map(([id, val]) => ({
            student_id: parseInt(id),
            marks_obtained: val === '' ? null : parseInt(val)
        }));

        try {
            await api.post(`/tests/${gradingTest.id}/marks`, {
                marks: marksArray,
                markCompleted: isFinal
            });
            toast.success(isFinal ? "Marks finalized and test completed" : "Marks saved as draft");
            if (isFinal) {
                setGradingTest(null);
                fetchCreatedTests();
                setActiveTab('completed');
            } else {
                // Refresh list for the grading view
                const res = await api.get(`/tests/${gradingTest.id}/students`);
                setAssignedStudents(res.data);
            }
        } catch (err) {
            toast.error("Failed to update marks");
        }
    };

    const pendingTests = tests.filter(t => t.status !== 'Completed');
    const completedTests = tests.filter(t => t.status === 'Completed');

    if (gradingTest) {
        return (
            <div className="view-container fade-in">
                <div className="card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <button className="btn btn-sm btn-outline" style={{width: 'auto'}} onClick={() => setGradingTest(null)}>
                                <i className="material-icons">arrow_back</i>
                            </button>
                            <h3 style={{margin: 0}}>{gradingTest.title} (Max: {gradingTest.total_marks})</h3>
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                             <button className="btn btn-sm btn-secondary" style={{width: 'auto'}} onClick={() => submitMarks(false)}>Save Draft</button>
                             <button className="btn btn-sm btn-primary" style={{width: 'auto'}} onClick={() => submitMarks(true)}>Finalize & Complete</button>
                        </div>
                    </div>

                    <div className="table-wrapper" style={{background: 'var(--bg-color)', borderRadius: '12px', overflow: 'hidden'}}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Register No</th>
                                    <th>Student Name</th>
                                    <th>Obtained Marks</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedStudents.map(s => (
                                    <tr key={s.student_id}>
                                        <td>{s.register_number}</td>
                                        <td>{s.student_name}</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                style={{width: '100px'}}
                                                max={gradingTest.total_marks}
                                                value={marksData[s.student_id]}
                                                onChange={(e) => handleMarkChange(s.student_id, e.target.value)}
                                                placeholder="Score"
                                            />
                                        </td>
                                        <td>
                                            <span className={`badge ${s.marks_obtained !== null ? 'badge-success' : 'badge-warning'}`}>
                                                {s.marks_obtained !== null ? 'Graded' : 'Waiting'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container fade-in">
            <h2 style={{marginTop: 0, marginBottom: '25px', color: 'var(--primary)'}}>Test Management</h2>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '10px 10px 0 0',
                        border: 'none',
                        background: activeTab === 'create' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'create' ? 'white' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '8px'}}>add_circle</i>
                    Create Test
                </button>
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '10px 10px 0 0',
                        border: 'none',
                        background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'pending' ? 'white' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '8px'}}>pending_actions</i>
                    Pending ({pendingTests.length})
                </button>
                <button 
                    onClick={() => setActiveTab('completed')}
                    className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '10px 10px 0 0',
                        border: 'none',
                        background: activeTab === 'completed' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'completed' ? 'white' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '8px'}}>task_alt</i>
                    Completed ({completedTests.length})
                </button>
            </div>

            {loading ? (
                <div style={{textAlign: 'center', padding: '100px'}}>
                    <div className="loader" style={{border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px'}}></div>
                    <p style={{color: 'var(--text-muted)'}}>Loading data...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <div className="tab-content">
                    {activeTab === 'create' && (
                        <div className="card fade-in" style={{maxWidth: '850px', margin: '0 auto', padding: '30px'}}>
                            <h3 style={{marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <i className="material-icons" style={{color: 'var(--primary)'}}>campaign</i> 
                                New Test Announcement
                            </h3>
                            <form onSubmit={handleCreateTest}>
                                <div className="form-group mb-4">
                                    <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Test Title</label>
                                    <input type="text" className="form-control" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Unit Test 1 - Data Structures" />
                                </div>
                                <div className="form-group mb-4">
                                    <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Description / Topics</label>
                                    <textarea className="form-control" rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Topics covered, special instructions for students..."></textarea>
                                </div>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                                    <div className="form-group">
                                        <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Total Marks</label>
                                        <input type="number" className="form-control" required value={formData.total_marks} onChange={(e) => setFormData({...formData, total_marks: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Duration (Mins)</label>
                                        <input type="number" className="form-control" required value={formData.duration_mins} onChange={(e) => setFormData({...formData, duration_mins: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{fontWeight: '600', marginBottom: '8px', display: 'block'}}>Date</label>
                                        <input type="date" className="form-control" required value={formData.test_date} onChange={(e) => setFormData({...formData, test_date: e.target.value})} />
                                    </div>
                                </div>
                                <div style={{marginTop: '35px', textAlign: 'right'}}>
                                    <button type="submit" className="btn btn-primary" style={{width: 'auto', padding: '14px 40px', fontSize: '1rem'}}>
                                        Create & Notify Students
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {(activeTab === 'pending' || activeTab === 'completed') && (
                        <div className="fade-in">
                            {(activeTab === 'pending' ? pendingTests : completedTests).length > 0 ? (
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px'}}>
                                    {(activeTab === 'pending' ? pendingTests : completedTests).map(t => (
                                        <div key={t.id} className="card hover-scale" style={{
                                            borderLeft: `8px solid ${activeTab === 'pending' ? 'var(--primary)' : 'var(--success)'}`,
                                            padding: '25px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div>
                                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                                                    <h3 style={{margin: 0, fontSize: '1.2rem'}}>{t.title}</h3>
                                                    <span className={`badge ${activeTab === 'pending' ? 'badge-warning' : 'badge-success'}`} style={{height: '24px', display: 'flex', alignItems: 'center'}}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px'}}>
                                                    <i className="material-icons" style={{fontSize: '16px', verticalAlign: 'middle', marginRight: '5px'}}>event</i>
                                                    {new Date(t.test_date).toLocaleDateString()}
                                                </p>
                                                
                                                <div style={{display: 'flex', gap: '20px', marginBottom: '25px', padding: '12px', background: 'var(--bg-color)', borderRadius: '10px'}}>
                                                    <div>
                                                        <small style={{display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem'}}>Max Marks</small>
                                                        <strong style={{color: 'var(--text-main)'}}>{t.total_marks}</strong>
                                                    </div>
                                                    <div style={{borderLeft: '1px solid var(--border-color)', paddingLeft: '15px'}}>
                                                        <small style={{display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem'}}>Duration</small>
                                                        <strong style={{color: 'var(--text-main)'}}>{t.duration_mins} mins</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                className="btn btn-outline" 
                                                style={{width: '100%', padding: '12px'}}
                                                onClick={() => startGrading(t)}
                                            >
                                                <i className="material-icons" style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '8px'}}>
                                                    {activeTab === 'pending' ? 'edit' : 'visibility'}
                                                </i>
                                                {activeTab === 'pending' ? 'Enter / Grade Marks' : 'View Test Results'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="card" style={{padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
                                    <i className="material-icons" style={{fontSize: '5rem', marginBottom: '20px', opacity: 0.3}}>quiz</i>
                                    <h3>No {activeTab} tests found.</h3>
                                    <p>Start by creating a new test in the 'Create Test' tab.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageTests;
