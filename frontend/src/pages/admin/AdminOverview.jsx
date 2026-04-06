import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminOverview.css';



// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement
);

const AdminOverview = () => {
    const [stats, setStats] = useState({ faculties: 0, students: 0, issues: 0 });
    const [riskData, setRiskData] = useState([]);
    const [facultyRiskData, setFacultyRiskData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [criticalAlerts, setCriticalAlerts] = useState({ highRisk: 0, lowAttendance: 0 });
    const [topRiskStudents, setTopRiskStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats
                const [facRes, stuRes, repRes, discRes] = await Promise.all([
                   api.get('/faculties'),
                   api.get('/students'),
                   api.get('/reports/performance'),
                   api.get('/disciplinary')
                ]);
                
                setStats({
                   faculties: facRes.data.length,
                   students: stuRes.data.length,
                   issues: discRes.data.length
                });
                
                setRiskData(repRes.data.risks || []);
                setFacultyRiskData(repRes.data.facultyRisks || []);
                setSubjectData(repRes.data.subjects || []);
                
                const highRiskCount = (repRes.data.risks || []).reduce((acc, r) => {
                    return (r.risk_level.includes('High') || r.risk_level.includes('Red')) ? acc + r.count : acc;
                }, 0);
                
                setCriticalAlerts({
                    highRisk: highRiskCount,
                    lowAttendance: repRes.data.lowAttendanceCount || 0
                });
                setTopRiskStudents(repRes.data.topRiskStudents || []);
                setLoading(false);
            } catch(e) {
                console.error("Dashboard error", e);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div style={{textAlign: 'center', padding: '50px', color: 'var(--text-muted)'}}>Loading dashboard data...</div>;

    // --- Chart Configurations ---
    const safeRiskData = Array.isArray(riskData) ? riskData : [];
    const riskPieConfig = {
        labels: safeRiskData.map(r => r.risk_level === 'None' ? 'Safe' : r.risk_level),
        datasets: [{
            data: safeRiskData.map(r => r.count),
            backgroundColor: [
                '#10B981', // Safe (Green)
                '#F59E0B', // Attendance Risk (Orange)
                '#3B82F6', // Assignment Risk (Blue)
                '#8B5CF6', // Disciplinary Risk (Purple)
                '#EF4444'  // High Academic Risk (Red)
            ],
            borderWidth: 1,
        }]
    };

    const safeFacultyRiskData = Array.isArray(facultyRiskData) ? facultyRiskData : [];
    const facultyPieConfig = {
        labels: safeFacultyRiskData.map(r => r.risk_level),
        datasets: [{
            data: safeFacultyRiskData.map(r => r.count),
            backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
            borderWidth: 1,
        }]
    };

    const safeSubjectData = Array.isArray(subjectData) ? subjectData : [];
    const subjectBarConfig = {
        labels: safeSubjectData.map(s => s.subject_name || s.course_code),
        datasets: [{
            label: 'Pass Percentage (%)',
            data: safeSubjectData.map(s => parseFloat(s.pass_percentage)),
            backgroundColor: safeSubjectData.map(s => parseFloat(s.pass_percentage) < 50 ? 'rgba(244, 67, 54, 0.6)' : 'rgba(54, 162, 235, 0.6)'),
            borderColor: safeSubjectData.map(s => parseFloat(s.pass_percentage) < 50 ? 'rgba(244, 67, 54, 1)' : 'rgba(54, 162, 235, 1)'),
            borderWidth: 1,
        }]
    };




    return (
        <div className="admin-overview fade-in">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h1 className="welcome-text" style={{margin: 0}}>Admin Dashboard</h1>
            </div>
            
            {/* Summary Cards */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon students">🎓</div>
                    <div className="stat-info">
                        <p>Total Students</p>
                        <h2>{stats.students}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon faculties">👨‍🏫</div>
                    <div className="stat-info">
                        <p>Total Faculty</p>
                        <h2>{stats.faculties}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon issues danger">⚠️</div>
                    <div className="stat-info">
                        <p>Disciplinary Issues</p>
                        <h2>{stats.issues}</h2>
                    </div>
                </div>
            </div>

            {/* Critical Alerts Section */}
            <div className="section-container mt-4">
                <h3 className="section-title">Critical Alerts</h3>
                <div className="critical-alerts">
                    <div className="alert-card high-risk">
                        <div className="alert-count">{criticalAlerts.highRisk}</div>
                        <div className="alert-label">High-Risk Students</div>
                        <p className="alert-desc">Immediate intervention recommended</p>
                    </div>
                    <div className="alert-card low-attendance">
                        <div className="alert-count">{criticalAlerts.lowAttendance}</div>
                        <div className="alert-label">Low Attendance</div>
                        <p className="alert-desc">Students below 75% threshold</p>
                    </div>
                    <div className="alert-card open-issues">
                        <div className="alert-count">{stats.issues}</div>
                        <div className="alert-label">Discipline Issues</div>
                        <p className="alert-desc">Unresolved behavioral records</p>
                    </div>
                </div>
            </div>

            <div className="charts-grid-main mt-4">
                <div className="chart-box card">
                    <h3>Risk Distribution</h3>
                    <div className="pie-container">
                        <Pie data={riskPieConfig} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>

                <div className="chart-box card">
                    <h3>Faculty Performance Summary</h3>
                    <div className="pie-container">
                         <Bar 
                            data={{
                                labels: facultyRiskData.map(f => f.risk_level.length > 10 ? f.risk_level.substring(0, 10) + '...' : f.risk_level),
                                datasets: [{
                                    label: 'Avg Predicted GPA',
                                    data: facultyRiskData.map(f => f.avg_gpa),
                                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                    borderRadius: 4
                                }]
                            }} 
                            options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 10 } } }} 
                        />
                    </div>
                </div>
            </div>

            <div className="chart-box card full-width mt-4">
                <h3>Subject-Wise Performance (Pass Percentage)</h3>
                <div className="bar-container" style={{ height: '300px' }}>
                    <Bar 
                        data={subjectBarConfig} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true, max: 100 } }
                        }} 
                    />
                </div>
            </div>
            
            <div className="card mt-4">
                <h3 className="section-title">Top High-Risk Students</h3>
                {topRiskStudents.length > 0 ? (
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Reg No</th>
                                    <th>Name</th>
                                    <th>Risk Level</th>
                                    <th>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topRiskStudents.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.register_number}</td>
                                        <td>{s.name}</td>
                                        <td><span className={`risk-pill ${s.risk_level.includes('High') ? 'high' : (s.risk_level.includes('Risk') || s.risk_level === 'Medium') ? 'medium' : 'low'}`}>{s.risk_level}</span></td>
                                        <td>{s.performance_level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="empty-msg">No high-risk students detected. Keep up the good work!</p>}
            </div>
            
            <div style={{marginTop: '40px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)'}}>
                <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i className="material-icons" style={{fontSize: '18px'}}>info_outline</i>
                    <strong>Prediction Insight:</strong> AI-driven risk assessments are updated in real-time based on internal marks, attendance fluctuations, and disciplinary activity. High-risk alerts indicate students requiring immediate faculty intervention.
                </p>
            </div>

            {safeSubjectData.some(s => parseFloat(s.pass_percentage) < 50) && (
                 <div className="alert-box danger mt-4">
                     <strong>Attention:</strong> The following subjects have a pass rate below 50%: {safeSubjectData.filter(s => parseFloat(s.pass_percentage) < 50).map(s => s.subject_name || s.course_code).join(', ')}
                 </div>
            )}
        </div>
    );
};

export default AdminOverview;
