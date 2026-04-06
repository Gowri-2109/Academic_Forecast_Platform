import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FacultyViews.css';
import { toast } from 'react-toastify';



const IssuesTracker = () => {
    const userId = localStorage.getItem('userId');
    const [issuesData, setIssuesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, High Risk, Discipline, Low Attendance

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/faculties/${userId}/issues`);
            setIssuesData(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load generic issues tracker data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchIssues();
    }, [userId]);

    // Process data for rendering based on filter
    const getFilteredData = () => {
        if (!Array.isArray(issuesData)) return [];
        let data = [...issuesData];
        if (filter === 'High Risk') {
            data = data.filter(d => d.risk_level === 'High' || d.overall_risk_score >= 70);
        } else if (filter === 'Discipline') {
            data = data.filter(d => d.disciplinary_count > 0);
        } else if (filter === 'Low Attendance') {
            data = data.filter(d => d.lowest_attendance !== null && d.lowest_attendance < 75);
        }
        return data.sort((a,b) => (b.overall_risk_score || 0) - (a.overall_risk_score || 0));
    };

    const displayData = getFilteredData();

    if(loading) return (
        <div style={{textAlign: 'center', padding: '100px'}}>
            <div className="loader" style={{border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px'}}></div>
            <p style={{color: 'var(--text-muted)'}}>Analyzing student risk factors...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="view-container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2 style={{margin: 0}}>Issues Tracker</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    <select 
                        className="btn btn-outline" 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        style={{padding: '8px 15px', borderRadius: '20px', backgroundColor: 'var(--card-bg)'}}
                    >
                        <option value="All">All Tracked Students</option>
                        <option value="High Risk">High Risk Only</option>
                        <option value="Discipline">Has Disciplinary Records</option>
                        <option value="Low Attendance">Low Attendance (&lt;75%)</option>
                    </select>
                </div>
            </div>
            
            <div className="tracker-card" style={{background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '25px', marginBottom: '30px'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem'}}>
                    This tracker highlights assigned students who fall into at-risk categories. Keep a close eye on their performance, disciplinary actions, and attendance to provide timely support.
                </p>

                <div className="table-wrapper">
                    <table className="data-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{background: 'var(--table-header-bg, var(--input-bg))', borderBottom: '2px solid var(--border-color)'}}>
                                <th style={{padding: '15px', textAlign: 'left'}}>Student Name & Reg No</th>
                                <th style={{padding: '15px', textAlign: 'center'}}>Priority</th>
                                <th style={{padding: '15px', textAlign: 'center'}}>Risk Level</th>
                                <th style={{padding: '15px', textAlign: 'center'}}>Risk Score %</th>
                                <th style={{padding: '15px', textAlign: 'center'}}>Reason</th>
                                <th style={{padding: '15px', textAlign: 'center'}}>Lowest Subject Attendance</th>
                                <th style={{padding: '15px', textAlign: 'center'}}>Disciplinary Issues</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.map((student) => (
                                <tr key={student.student_id} style={{
                                    borderBottom: '1px solid var(--border-color)', 
                                    background: student.risk_level === 'High' ? 'rgba(229, 57, 53, 0.05)' : 'transparent',
                                    transition: 'background 0.3s ease'
                                }}>
                                    <td style={{padding: '15px'}}>
                                        <div style={{fontWeight: '600', color: 'var(--text-main)'}}>{student.name}</div>
                                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{student.register_number}</div>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        <span className={`badge ${student.priority === 'High' ? 'badge-danger' : student.priority === 'Medium' ? 'badge-warning' : 'badge-success'}`} style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                            {student.priority || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        <span style={{
                                            fontWeight: '600',
                                            color: student.risk_level === 'High' ? '#e53935' : student.risk_level === 'Medium' ? '#f9a825' : '#43a047'
                                        }}>
                                            {student.risk_level || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        <div style={{display: 'inline-block', width: '60px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', height: '8px', overflow: 'hidden', verticalAlign: 'middle', marginRight: '10px'}}>
                                            <div style={{height: '100%', width: `${student.overall_risk_score || 0}%`, background: student.overall_risk_score >= 70 ? '#e53935' : student.overall_risk_score >= 40 ? '#fdd835' : '#43a047'}}></div>
                                        </div>
                                        <span style={{fontWeight: '500', fontSize: '0.9rem'}}>{student.overall_risk_score || 0}%</span>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: student.risk_reason === 'Stable' ? 'italic' : 'normal'}}>
                                            {student.risk_reason}
                                        </span>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        {student.lowest_attendance !== null ? (
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                                <span style={{
                                                    fontWeight: '700',
                                                    color: student.lowest_attendance < 75 ? '#d32f2f' : '#2e7d32'
                                                }}>
                                                    {student.lowest_attendance}%
                                                </span>
                                                <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                                                    in {student.lowest_attendance_subject}
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{color: '#999'}}>No Data</span>
                                        )}
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            background: student.disciplinary_count > 0 ? '#ffebee' : '#f5f5f5',
                                            color: student.disciplinary_count > 0 ? '#c62828' : '#9e9e9e',
                                            fontWeight: 'bold', fontSize: '0.85rem'
                                        }}>
                                            {student.disciplinary_count}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {displayData.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
                                        No students found matching the current filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IssuesTracker;
