import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../faculty/FacultyViews.css';

const StudentMarks = () => {
    const studentId = localStorage.getItem('userId');
    const [marks, setMarks] = useState([]);
    const [assignmentMarks, setAssignmentMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('exam');

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const [marksRes, assignRes] = await Promise.all([
                    api.get(`/marks/${studentId}`),
                    api.get(`/faculty-assignments/student/${studentId}`)
                ]);
                setMarks(marksRes.data);
                
                // Filter only submitted assignments that naturally contain score data
                setAssignmentMarks(assignRes.data.filter(a => a.status === 'Submitted'));
                setLoading(false);
            } catch (err) {
                console.error("Failed to load marks", err);
                setLoading(false);
            }
        };
        fetchMarks();
    }, [studentId]);

    return (
        <div className="view-container fade-in">
            {/* Premium Header */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '40px', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: '40px',
                borderRadius: '24px',
                color: 'white',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{zIndex: 1}}>
                    <h2 style={{margin: 0, fontSize: '2.2rem', fontWeight: '800'}}>Verified Academic Results</h2>
                    <p style={{margin: '10px 0 0 0', opacity: 0.8, fontSize: '1.1rem'}}>Official internal assessment and assignment marks</p>
                </div>
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px 30px', borderRadius: '20px', backdropFilter: 'blur(10px)', zIndex: 1, textAlign: 'right', border: '1px solid rgba(255,255,255,0.1)'}}>
                    <span style={{fontSize: '0.8rem', display: 'block', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600', marginBottom: '5px'}}>Total Subjects</span>
                    <strong style={{fontSize: '2rem'}}>{marks.length}</strong>
                </div>
                <div style={{position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '14rem', opacity: 0.05, transform: 'rotate(-15deg)'}}>analytics</div>
            </div>
            
            {/* AI Highlight Alert */}
            {marks.length > 0 && (
                <div className="fade-in-up" style={{
                    background: 'var(--card-bg)',
                    padding: '30px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    borderLeft: '8px solid #f44336',
                    marginBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '25px',
                    boxShadow: '0 15px 35px rgba(244, 67, 54, 0.08)'
                }}>
                    <div style={{
                        width: '60px', 
                        height: '60px', 
                        background: 'rgba(244, 67, 54, 0.1)', 
                        borderRadius: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <i className="material-icons" style={{fontSize: '32px', color: '#f44336'}}>psychology</i>
                    </div>
                    <div>
                        <div style={{fontWeight: '800', color: '#d32f2f', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px'}}>AI Critical Observation</div>
                        <div style={{color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '500'}}>
                            Performance gap detected in <strong>{marks.reduce((prev, curr) => (prev.internal_mark < curr.internal_mark) ? prev : curr).subject_name}</strong> 
                            <span style={{marginLeft: '12px', background: 'rgba(244, 67, 54, 0.15)', color: '#d32f2f', padding: '4px 12px', borderRadius: '10px', fontWeight: '800'}}>Score: {marks.reduce((prev, curr) => (prev.internal_mark < curr.internal_mark) ? prev : curr).internal_mark}</span>
                        </div>
                    </div>
                    <div style={{marginLeft: 'auto'}}>
                        <button className="btn btn-outline btn-sm" style={{borderColor: '#f44336', color: '#f44336', fontWeight: '700'}}>View Resources</button>
                    </div>
                </div>
            )}
            
            {/* Modern Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '40px', 
                background: 'var(--card-bg)', 
                padding: '10px', 
                borderRadius: '18px',
                width: 'fit-content',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                border: '1px solid var(--border-color)'
            }}>
                <button 
                    className={`nav-tab ${activeTab === 'exam' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exam')}
                    style={{
                        padding: '14px 28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: activeTab === 'exam' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'exam' ? 'white' : 'var(--text-muted)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '20px'}}>assignment</i>
                    Internal Assessments
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'assignment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignment')}
                    style={{
                        padding: '14px 28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: activeTab === 'assignment' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'assignment' ? 'white' : 'var(--text-muted)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '20px'}}>task</i>
                    Practical Assignments
                </button>
            </div>

            <div className="table-wrapper fade-in-up" style={{
                background: 'var(--card-bg)', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                border: '1px solid var(--border-color)'
            }}>
                {activeTab === 'exam' && (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{padding: '20px 25px'}}>Course Code</th>
                            <th style={{padding: '20px 25px'}}>Subject Identity</th>
                            <th style={{padding: '20px 25px', textAlign: 'center', width: '200px'}}>Final Internal Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="text-center" style={{padding: '50px', color: 'var(--text-muted)'}}>Consolidating results...</td></tr>
                        ) : marks.length > 0 ? (
                            marks.map(m => (
                                <tr key={m.id} className="hover-row">
                                    <td style={{padding: '20px 25px'}}><span style={{background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem'}}>{m.course_code}</span></td>
                                    <td style={{padding: '20px 25px'}}><strong>{m.subject_name}</strong></td>
                                    <td style={{padding: '20px 25px', textAlign: 'center'}}>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '8px 20px',
                                            borderRadius: '15px',
                                            background: m.internal_mark < 50 ? 'rgba(239, 68, 68, 0.1)' : m.internal_mark >= 85 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                                            color: m.internal_mark < 50 ? 'var(--danger)' : m.internal_mark >= 85 ? 'var(--success)' : 'var(--primary)',
                                            fontWeight: '800',
                                            fontSize: '1.2rem',
                                            minWidth: '100px',
                                            border: '1px solid currentColor'
                                        }}>
                                            {m.internal_mark} <span style={{fontSize: '0.8rem', opacity: 0.7}}>/ 100</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center" style={{padding: '100px'}}>
                                <i className="material-icons" style={{fontSize: '4rem', color: 'var(--border-color)', marginBottom: '20px'}}>analytics</i>
                                <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>No official assessment marks have been posted yet.</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
                )}

                {activeTab === 'assignment' && (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{padding: '20px 25px'}}>Original Assignment Title</th>
                            <th style={{padding: '20px 25px'}}>Submission Format</th>
                            <th style={{padding: '20px 25px', textAlign: 'center', width: '200px'}}>Obtained Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="text-center" style={{padding: '50px', color: 'var(--text-muted)'}}>Retrieving evaluation data...</td></tr>
                        ) : assignmentMarks.length > 0 ? (
                            assignmentMarks.map(a => (
                                <tr key={a.id} className="hover-row">
                                    <td style={{padding: '20px 25px'}}><strong>{a.title}</strong></td>
                                    <td style={{padding: '20px 25px'}}><span style={{textTransform: 'capitalize', background: 'var(--bg-color)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem'}}>{a.submission_type}</span></td>
                                    <td style={{padding: '20px 25px', textAlign: 'center'}}>
                                        {a.score !== null ? (
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '8px 20px',
                                                borderRadius: '15px',
                                                background: a.score >= (a.max_marks * 0.8) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                                                color: a.score >= (a.max_marks * 0.8) ? 'var(--success)' : 'var(--primary)',
                                                fontWeight: '800',
                                                fontSize: '1.2rem',
                                                minWidth: '100px',
                                                border: '1px solid currentColor'
                                            }}>
                                                {a.score} <span style={{fontSize: '0.8rem', opacity: 0.7}}>/ {a.max_marks}</span>
                                            </div>
                                        ) : (
                                            <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic'}}>Under Faculty Review</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center" style={{padding: '100px'}}>
                                <i className="material-icons" style={{fontSize: '4rem', color: 'var(--border-color)', marginBottom: '20px'}}>assignment_late</i>
                                <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>No evaluated assignments found in your portfolio.</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    );
};

export default StudentMarks;
