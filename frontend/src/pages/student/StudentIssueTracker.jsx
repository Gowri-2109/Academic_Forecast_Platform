import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../faculty/FacultyViews.css';
import { toast } from 'react-toastify';

const StudentIssueTracker = () => {
    const studentId = localStorage.getItem('userId');
    const [attendance, setAttendance] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return;
            try {
                const [attRes, issRes] = await Promise.all([
                    api.get(`/attendance/${studentId}`),
                    api.get(`/disciplinary/${studentId}`)
                ]);
                setAttendance(attRes.data);
                setIssues(issRes.data);
            } catch (err) {
                console.error("Failed to load tracker data", err);
                toast.error("Failed to load tracker data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    const calculateOverallAttendance = () => {
        if (!attendance || !attendance.length) return 0;
        const total = attendance.reduce((acc, curr) => acc + parseFloat(curr.percentage || 0), 0);
        return Math.round(total / attendance.length);
    };

    const overallAtt = calculateOverallAttendance();

    return (
        <div className="view-container fade-in">
            {/* Premium Header */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '40px', 
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                padding: '40px',
                borderRadius: '24px',
                color: 'white',
                boxShadow: '0 20px 40px rgba(30, 41, 59, 0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{zIndex: 1}}>
                    <h2 style={{margin: 0, fontSize: '2.2rem', fontWeight: '800'}}>Issue Tracker</h2>
                    <p style={{margin: '10px 0 0 0', opacity: 0.8, fontSize: '1.1rem'}}>Official attendance monitoring and disciplinary records</p>
                </div>
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '20px 30px', borderRadius: '20px', backdropFilter: 'blur(10px)', zIndex: 1, textAlign: 'right', border: '1px solid rgba(255,255,255,0.1)'}}>
                    <span style={{fontSize: '0.8rem', display: 'block', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600', marginBottom: '5px'}}>Incidents Recorded</span>
                    <strong style={{fontSize: '2rem'}}>{issues.length}</strong>
                </div>
                <div style={{position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '14rem', opacity: 0.05, transform: 'rotate(-15deg)'}}>gavel</div>
            </div>

            {/* Overall Summary Cards */}
            <div className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '24px', borderLeft: `8px solid ${overallAtt >= 75 ? 'var(--success)' : 'var(--danger)'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                        <div style={{width: '50px', height: '50px', background: overallAtt >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <i className="material-icons" style={{color: overallAtt >= 75 ? 'var(--success)' : 'var(--danger)'}}>{overallAtt >= 75 ? 'check_circle' : 'warning'}</i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Attendance</h3>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}> {overallAtt}% </div>
                        </div>
                    </div>
                </div>
                
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '24px', borderLeft: `8px solid ${issues.length > 0 ? 'var(--danger)' : 'var(--success)'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                        <div style={{width: '50px', height: '50px', background: issues.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <i className="material-icons" style={{color: issues.length > 0 ? 'var(--danger)' : 'var(--success)'}}>{issues.length > 0 ? 'report' : 'verified_user'}</i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Disciplinary Profile</h3>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}> {issues.length > 0 ? 'Active Issues' : 'Clean Record'} </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '40px' }}>
                {/* Attendance Section */}
                <div className="fade-in-up">
                    <div className="premium-card" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid var(--border-color)', paddingBottom: '15px'}}>
                            <h3 style={{ margin: 0 }}>Course Attendance</h3>
                            <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600'}}>Target: 75%</span>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
                                    <tr>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>Subject Module</th>
                                        <th style={{ padding: '15px', textAlign: 'center' }}>Participation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="2" style={{ padding: '20px', textAlign: 'center' }}>Synchronizing...</td></tr>
                                    ) : attendance.length > 0 ? (
                                        attendance.map(a => (
                                            <tr key={a.id} className="hover-row">
                                                <td style={{ padding: '15px' }}><strong>{a.subject_name}</strong></td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <div style={{
                                                        padding: '5px 15px',
                                                        borderRadius: '12px',
                                                        background: a.percentage < 75 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                        color: a.percentage < 75 ? 'var(--danger)' : 'var(--success)',
                                                        fontWeight: '800',
                                                        display: 'inline-block',
                                                        minWidth: '80px'
                                                    }}>
                                                        {a.percentage}%
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="2" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No attendance data found in current semester.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Disciplinary Section */}
                <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="premium-card" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid var(--border-color)', paddingBottom: '15px'}}>
                            <h3 style={{ margin: 0 }}>Behavioral Audit</h3>
                            <i className="material-icons" style={{color: 'var(--text-muted)'}}>security</i>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
                                    <tr>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>Event Date</th>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>Classification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="2" style={{ padding: '20px', textAlign: 'center' }}>Loading audit...</td></tr>
                                    ) : issues.length > 0 ? (
                                        issues.map(iss => (
                                            <tr key={iss.id} className="hover-row">
                                                <td style={{ padding: '15px', whiteSpace: 'nowrap' }}>
                                                    <div style={{fontWeight: '700'}}>{new Date(iss.incident_date || iss.date).toLocaleDateString()}</div>
                                                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px'}}>{iss.description}</div>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{
                                                        padding: '5px 12px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: 'var(--danger)',
                                                        fontWeight: '700',
                                                        fontSize: '0.8rem',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {iss.issue_type}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="2" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <div style={{fontSize: '3rem', marginBottom: '15px'}}>🎉</div>
                                            <strong>Zero Incidents Detected</strong>
                                            <p style={{margin: '10px 0 0 0', fontSize: '0.9rem'}}>Maintain your professional conduct standards.</p>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentIssueTracker;
