import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FacultyViews.css';
import { toast } from 'react-toastify';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardOverview = () => {
    const userId = localStorage.getItem('userId');
    const [stats, setStats] = useState({
        totalAssignedStudents: 0,
        totalDisciplinaryIssues: 0,
        riskDistribution: [],
        subjectPerformance: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get(`/faculties/${userId}/dashboard-stats`);
                setStats({
                    totalAssignedStudents: res.data.totalAssignedStudents || 0,
                    totalDisciplinaryIssues: res.data.totalDisciplinaryIssues || 0,
                    riskDistribution: res.data.riskDistribution || [],
                    subjectPerformance: res.data.subjectPerformance || [],
                    highestSubject: res.data.highestSubject,
                    lowestSubject: res.data.lowestSubject,
                    aiInsights: res.data.aiInsights || null
                });
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                toast.error("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchStats();
    }, [userId]);

    if(loading) return (
        <div style={{textAlign: 'center', padding: '100px'}}>
            <div className="loader" style={{border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px'}}></div>
            <p style={{color: 'var(--text-muted)'}}>Generating mentorship insights...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    // Process Risk Data
    const riskMap = {'High': 0, 'Medium': 0, 'Low': 0, 'None/Unassessed': 0};
    let unassessedCount = stats.totalAssignedStudents;
    
    stats.riskDistribution.forEach(item => {
        const level = item.risk_level || 'None/Unassessed';
        const displayLevel = level === 'None' ? 'None/Unassessed' : level;
        if(riskMap[displayLevel] !== undefined) {
            riskMap[displayLevel] = item.count;
            unassessedCount -= item.count;
        } else {
             riskMap['None/Unassessed'] += item.count;
             unassessedCount -= item.count;
        }
    });
    
    if (unassessedCount > 0) {
        riskMap['None/Unassessed'] += unassessedCount;
    }

    const total = stats.totalAssignedStudents || 1; // Avoid div by zero
    const riskData = [
        { level: 'High', label: 'High Risk', count: riskMap['High'], icon: '🔥', color: '#ff4b2b', bg: 'linear-gradient(135deg, #ff416c, #ff4b2b)' },
        { level: 'Medium', label: 'Medium Risk', count: riskMap['Medium'], icon: '⚠️', color: '#f7b733', bg: 'linear-gradient(135deg, #f7b733, #fc4a1a)' },
        { level: 'Low', label: 'Low Risk', count: riskMap['Low'], icon: '✅', color: '#56ab2f', bg: 'linear-gradient(135deg, #56ab2f, #a8e063)' },
        { level: 'Unassessed', label: 'Unassessed', count: riskMap['None/Unassessed'], icon: '📁', color: '#bdc3c7', bg: 'linear-gradient(135deg, #bdc3c7, #2c3e50)' }
    ];

    const topRisk = riskData.reduce((prev, current) => (prev.count > current.count) ? prev : current);
    const riskInsightText = `The majority of your students (${topRisk.count}) are currently categorized under ${topRisk.label}.`;

    return (
        <div className="dashboard-overview view-container fade-in">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Academic Mentorship Overview</h2>
            <div className="stats-cards" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>👥</div>
                    <div className="stat-info">
                        <h3>Assigned Students</h3>
                        <h2>{stats.totalAssignedStudents}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#F44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>⚖️</div>
                    <div className="stat-info">
                        <h3>Disciplinary Issues</h3>
                        <h2>{stats.totalDisciplinaryIssues}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>⏰</div>
                    <div className="stat-info">
                        <h3>Last Updated</h3>
                        <h2 style={{ fontSize: '0.9rem' }}>{stats.aiInsights?.lastUpdated ? new Date(stats.aiInsights.lastUpdated).toLocaleTimeString() : '--:--'}</h2>
                    </div>
                </div>
            </div>

            {stats.aiInsights && (
                <div className="ai-insights-board" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', border: '1px solid #90caf9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1565c0' }}>
                        <span style={{ fontSize: '1.5rem' }}>🤖</span>
                        <h3 style={{ margin: 0 }}>AI Academic Insights</h3>
                    </div>
                    <div className="insights-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="insight-item">
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e88e5' }}>High Risk Alert</h4>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: stats.aiInsights.highRiskCount > 0 ? '#d32f2f' : '#2e7d32' }}>
                                {stats.aiInsights.highRiskCount} Students at High Risk
                            </p>
                        </div>
                        <div className="insight-item">
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e88e5' }}>Primary Risk Factor</h4>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{stats.aiInsights.primaryReason}</p>
                        </div>
                        <div className="insight-item">
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e88e5' }}>Subject Focus</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                Highest: <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{stats.highestSubject?.subject_name || 'N/A'}</span><br/>
                                Lowest: <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{stats.lowestSubject?.subject_name || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="charts-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div className="chart-card insight-card-container">
                    <h3 style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>Overall Student Risk Distribution</h3>
                    <div className="risk-insight-grid">
                        {riskData.map((item, idx) => (
                            <div className={`risk-insight-card ${item.level.toLowerCase()}`} key={idx} style={{ background: item.bg }}>
                                <div className="risk-card-icon">{item.icon}</div>
                                <div className="risk-card-info">
                                    <span className="risk-card-label">{item.label}</span>
                                    <h2 className="risk-card-number">{item.count}</h2>
                                    <span className="risk-card-pct">{((item.count / total) * 100).toFixed(1)}% of total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="ai-insight-footer" style={{ marginTop: '1.5rem', padding: '12px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>💡</span> AI Insight: {riskInsightText}
                    </div>
                </div>

                <div className="chart-card">
                    <h3 style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>Subject Performance Analysis</h3>
                    {stats.subjectPerformance.length > 0 ? (
                        <div style={{ height: '400px', width: '100%' }}>
                            <Bar 
                                data={{
                                    labels: stats.subjectPerformance.map(s => s.subject_name),
                                    datasets: [
                                        {
                                            label: 'Average Internal Marks (%)',
                                            data: stats.subjectPerformance.map(s => s.average_marks),
                                            backgroundColor: stats.subjectPerformance.map(s => 
                                                s.subject_name === stats.highestSubject?.subject_name ? '#4CAF50' : 
                                                s.subject_name === stats.lowestSubject?.subject_name ? '#F44336' : '#2196F3'
                                            ),
                                            borderRadius: 8,
                                            barThickness: 25,
                                        }
                                    ]
                                }}
                                options={{
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            callbacks: {
                                                label: (context) => `Avg Mark: ${context.parsed.x.toFixed(1)}%`
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            max: 100,
                                            grid: { color: 'rgba(0,0,0,0.05)' },
                                            ticks: { font: { size: 12 } }
                                        },
                                        y: {
                                            grid: { display: false },
                                            ticks: { 
                                                font: { size: 12, weight: '500' },
                                                autoSkip: false
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                         <div style={{color: '#888', textAlign: 'center', padding: '40px'}}>No performance data available. Students need marks assigned.</div>
                    )}
                    
                    {stats.subjectPerformance.length > 0 && (
                        <div className="dynamic-subject-insights" style={{ marginTop: '1rem', padding: '15px', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Highest Scoring Subject</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{stats.highestSubject?.subject_name}</span>
                                        <span className="badge badge-success">{Number(stats.highestSubject?.average_marks).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lowest Scoring Subject</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <span style={{ color: '#F44336', fontWeight: 'bold' }}>{stats.lowestSubject?.subject_name}</span>
                                        <span className="badge badge-danger">{Number(stats.lowestSubject?.average_marks).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{marginTop: '40px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)'}}>
                <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i className="material-icons" style={{fontSize: '18px'}}>info_outline</i>
                    <strong>Prediction Insight:</strong> Faculty-specific dashboards curate risk data based on assigned students only. Predictions consider historical GPA trends, current semester performance, and behavioral triggers from the disciplinary tracker.
                </p>
            </div>
        </div>
    );
};

export default DashboardOverview;
