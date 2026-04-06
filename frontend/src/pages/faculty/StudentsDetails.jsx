import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FacultyViews.css';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';



ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StudentsDetails = () => {
    const userId = localStorage.getItem('userId');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState({ 
        marks: [], 
        attendance: [], 
        issues: [], 
        prediction: null,
        trend: [] 
    });

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/faculties/${userId}/students`);
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch assigned students", err);
            toast.error("Failed to load students.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchStudents();
    }, [userId]);

    const handleViewStudent = async (student) => {
        setSelectedStudent(student);
        // Fetch detailed info
        try {
            const [mRes, aRes, dRes, pRes, tRes] = await Promise.all([
                api.get(`/marks/${student.id}`),
                api.get(`/attendance/${student.id}`),
                api.get(`/disciplinary/${student.id}`),
                api.get(`/predict/${student.id}`),
                api.get(`/students/${student.id}/performance-trend`)
            ]);
            setStudentDetails({
                marks: mRes.data,
                attendance: aRes.data,
                issues: dRes.data,
                prediction: pRes.data,
                trend: tRes.data
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch complete student details");
        }
    };

    if(loading) return (
        <div style={{textAlign: 'center', padding: '100px'}}>
            <div className="loader" style={{border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px'}}></div>
            <p style={{color: 'var(--text-muted)'}}>Loading student roster...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const lowestMarkSubject = studentDetails.marks.length > 0 
        ? [...studentDetails.marks].sort((a, b) => a.internal_mark - b.internal_mark)[0] 
        : null;

    if (selectedStudent) {
        return (
            <div className="view-container">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>
                        <i className="material-icons" style={{verticalAlign: 'middle'}}>arrow_back</i> Back to List
                    </button>
                    <div className="last-updated-pill">Last Prediction: {new Date().toLocaleDateString()}</div>
                </div>
                
                <div className="details-header" style={{marginBottom: '35px'}}>
                    <h2 style={{marginTop: 0, color: 'var(--text-main)', fontSize: '2.2rem', fontWeight: '800'}}>{selectedStudent.name}</h2>
                    <div style={{display: 'flex', gap: '25px', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '12px'}}>
                        <p style={{margin: 0, fontSize: '1.1rem'}}><strong>Reg No:</strong> {selectedStudent.register_number}</p>
                        <p style={{margin: 0, fontSize: '1.1rem'}}><strong>Dept:</strong> {selectedStudent.department}</p>
                        <p style={{margin: 0, fontSize: '1.1rem'}}><strong>Sem:</strong> {selectedStudent.semester}</p>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="student-summary-grid">
                    <div className="summary-card">
                        <span className="summary-label">Predicted GPA</span>
                        <div className="summary-value" style={{color: '#4f46e5'}}>{studentDetails.prediction?.predicted_gpa || 'N/A'}</div>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Risk Level</span>
                        <div className={`summary-value risk-${(studentDetails.prediction?.risk_level || 'Low').toLowerCase()}`}>
                            {studentDetails.prediction?.risk_level || 'Low'}
                        </div>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Avg Attendance</span>
                        <div className="summary-value" style={{color: (studentDetails.prediction?.metrics?.average_attendance || 100) < 75 ? '#ff4b2b' : '#2e7d32'}}>
                            {(studentDetails.prediction?.metrics?.average_attendance || 0).toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="details-grid-enhanced" style={{display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '35px'}}>
                    
                    {/* Main Performance Column */}
                    <div className="performance-column">
                        
                        {/* AI Structured Recommendations */}
                        {studentDetails.prediction && (
                            <div className="detail-card structured-ai-card">
                                <h4><span style={{fontSize: '1.4rem', marginRight: '10px'}}>🤖</span> AI Academic Recommendations</h4>
                                <div className="ai-report-grid">
                                    <div className="ai-report-item">
                                        <span>Current Risk Status</span>
                                        <div className={`badge-risk-${(studentDetails.prediction.risk_level || 'Low').toLowerCase()}`}>
                                            {studentDetails.prediction.risk_level} ({studentDetails.prediction.risk_score_percentage}%)
                                        </div>
                                    </div>
                                    <div className="ai-report-item">
                                        <span>Primary Risk Reason</span>
                                        <strong style={{color: '#1e293b', fontSize: '1.1rem'}}>{studentDetails.prediction.reason || 'Consistent Performance'}</strong>
                                    </div>
                                    <div className="ai-report-item full-width">
                                        <span>Smart Action Suggestion</span>
                                        <p className="ai-suggestion-text">{studentDetails.prediction.suggestions}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Performance Trend Chart */}
                        <div className="detail-card">
                            <h4><span style={{fontSize: '1.4rem', marginRight: '10px'}}>📈</span> Performance Trend (GPA)</h4>
                            <div style={{height: '300px', width: '100%'}}>
                                {studentDetails.trend.length > 0 ? (
                                    <Line 
                                        data={{
                                            labels: studentDetails.trend.map( t => `Sem ${t.semester}`),
                                            datasets: [{
                                                label: 'Semester GPA',
                                                data: studentDetails.trend.map(t => t.gpa),
                                                borderColor: '#4f46e5',
                                                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                                tension: 0.4,
                                                fill: true,
                                                pointRadius: 6,
                                                pointBackgroundColor: '#4f46e5',
                                                pointBorderColor: '#fff',
                                                pointHoverRadius: 9
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 2 } },
                                                x: { grid: { display: false } }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="no-data-placeholder">No historical performance data available for this student.</div>
                                )}
                            </div>
                        </div>

                        {/* Marks Section */}
                        <div className="detail-card">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                                <h4 style={{margin: 0}}><span style={{fontSize: '1.4rem', marginRight: '10px'}}>🎯</span> Academic Marks</h4>
                                {lowestMarkSubject && (
                                    <div className="insight-pill">
                                        ⚠️ Weak Area: {lowestMarkSubject.subject_name} ({lowestMarkSubject.internal_mark})
                                    </div>
                                )}
                            </div>
                            {studentDetails.marks.length > 0 ? (
                                <table className="mini-table" style={{width: '100%'}}>
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th style={{textAlign: 'center'}}>Marks (100)</th>
                                            <th style={{textAlign: 'right'}}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentDetails.marks.map(m => (
                                            <tr key={m.id}>
                                                <td>{m.subject_name}</td>
                                                <td style={{textAlign: 'center', fontWeight: '800', fontSize: '1.1rem'}}>{m.internal_mark}</td>
                                                <td style={{textAlign: 'right'}}>
                                                    <span className={m.internal_mark < 50 ? 'text-danger' : 'text-success'} style={{fontWeight: '600'}}>
                                                        {m.internal_mark < 50 ? '⚠️ Critical' : '✅ Passing'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="no-data">No marks recorded for this semester.</p>}
                        </div>
                    </div>

                    {/* Secondary Metrics Column */}
                    <div className="metrics-column">
                        
                        {/* Attendance Section */}
                        <div className="detail-card">
                            <h4><span style={{fontSize: '1.4rem', marginRight: '10px'}}>📊</span> Attendance Details</h4>
                            {studentDetails.attendance.length > 0 ? (
                                <table className="mini-table" style={{width: '100%'}}>
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th style={{textAlign: 'right'}}>%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentDetails.attendance.map(a => (
                                            <tr key={a.id}>
                                                <td>{a.subject_name}</td>
                                                <td style={{
                                                    textAlign: 'right', 
                                                    fontWeight: '800',
                                                    fontSize: '1.1rem',
                                                    color: parseFloat(a.percentage) < 75 ? '#ef4444' : '#10b981'
                                                }}>
                                                    {parseFloat(a.percentage || 0).toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="no-data">No attendance data found.</p>}
                        </div>

                        {/* Disciplinary Section */}
                        <div className="detail-card">
                            <h4><span style={{fontSize: '1.4rem', marginRight: '10px'}}>🛡️</span> Disciplinary Issues</h4>
                            {studentDetails.issues.length > 0 ? (
                                <div className="issue-cards-stack" style={{marginTop: '10px'}}>
                                    {studentDetails.issues.map(i => {
                                        const date = i.date && i.date !== '0000-00-00' ? new Date(i.date) : null;
                                        const formattedDate = date && !isNaN(date.getTime()) && date.getFullYear() > 1970 
                                            ? date.toLocaleDateString() 
                                            : "No Date Available";
                                        
                                        return (
                                            <div key={i.id} className="mini-issue-box">
                                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px'}}>
                                                    <span style={{fontWeight: '700', fontSize: '1rem', color: '#1e293b'}}>{i.issue_type}</span>
                                                    <span style={{fontSize: '0.8rem', color: '#64748b'}}>{formattedDate}</span>
                                                </div>
                                                <p style={{margin: '0 0 15px 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6'}}>{i.description}</p>
                                                <div style={{display: 'flex', gap: '10px'}}>
                                                    <span className={`status-pill status-${i.status?.toLowerCase().replace(' ', '') || 'open'}`}>
                                                        {i.status || 'Open'}
                                                    </span>
                                                    <span className={`priority-pill priority-${i.priority?.toLowerCase() || 'medium'}`}>
                                                        {i.priority || 'Medium'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p className="no-data">No disciplinary records found.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                <h2 style={{margin: 0}}>Assigned Students</h2>
            </div>
            {students.length > 0 ? (
                <div className="table-wrapper" style={{background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                    <table className="data-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{background: 'var(--table-header-bg, var(--input-bg))', borderBottom: '2px solid var(--border-color)'}}>
                                <th style={{padding: '15px', textAlign: 'left'}}>Reg No</th>
                                <th style={{padding: '15px', textAlign: 'left'}}>Name</th>
                                <th style={{padding: '15px', textAlign: 'left'}}>Department</th>
                                <th style={{padding: '15px', textAlign: 'left'}}>Avg Attendance</th>
                                <th style={{padding: '15px', textAlign: 'left'}}>Risk Level</th>
                                <th style={{padding: '15px', textAlign: 'center'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...students].sort((a,b) => String(a.register_number).localeCompare(String(b.register_number))).map(s => (
                                <tr key={s.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                    <td style={{padding: '15px'}}>{s.register_number}</td>
                                    <td style={{padding: '15px', fontWeight: '500'}}>{s.name}</td>
                                    <td style={{padding: '15px'}}>{s.department}</td>
                                    <td style={{padding: '15px'}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <div style={{width: '50px', height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden'}}>
                                                <div style={{width: `${s.avg_attendance || 0}%`, height: '100%', background: (s.avg_attendance || 0) < 75 ? '#ff4b2b' : '#56ab2f'}}></div>
                                            </div>
                                            <span style={{fontWeight: '600', color: (s.avg_attendance || 0) < 75 ? '#d32f2f' : 'inherit'}}>
                                                {parseFloat(s.avg_attendance || 0).toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{padding: '15px'}}>
                                        <span className={`badge ${s.risk_level === 'High' ? 'badge-danger' : s.risk_level === 'Medium' ? 'badge-warning' : s.risk_level === 'Low' ? 'badge-success' : 'badge-secondary'}`}>
                                            {s.risk_level || 'Unassessed'}
                                        </span>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'center'}}>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleViewStudent(s)}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state" style={{background: 'var(--card-bg)', padding: '40px', textAlign: 'center', borderRadius: '12px'}}>
                    <i className="material-icons" style={{fontSize: '48px', color: 'var(--text-muted)'}}>people_outline</i>
                    <h3>No Assigned Students</h3>
                    <p style={{color: 'var(--text-muted)'}}>You currently have no students assigned to you.</p>
                </div>
            )}
        </div>
    );
};

export default StudentsDetails;
