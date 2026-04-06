import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Doughnut } from 'react-chartjs-2';


import { toast } from 'react-toastify';

const AdminPredictionInsights = () => {
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchingInsights, setFetchingInsights] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/faculties');
                setFaculties(res.data);
                if (res.data.length > 0) {
                    const firstFac = res.data[0].user_id;
                    setSelectedFaculty(firstFac);
                    fetchInsights(firstFac);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchInsights = async (facultyId) => {
        setFetchingInsights(true);
        try {
            const res = await api.get(`/predict/faculty/${facultyId}`);
            setInsights(res.data);
        } catch (err) {
            console.error(err);
        }
        setFetchingInsights(false);
    };

    const handleFacultyChange = (e) => {
        const val = e.target.value;
        setSelectedFaculty(val);
        fetchInsights(val);
    };

    if (loading) return <div className="loading">Loading faculties...</div>;

    const riskDist = insights?.riskDistribution || [];
    const highRiskStudents = insights?.highRiskStudents || [];

    const pieData = {
        labels: riskDist.map(r => r.risk_level),
        datasets: [{
            data: riskDist.map(r => r.count),
            backgroundColor: riskDist.map(r => {
                if (r.risk_level === 'Low') return '#4CAF50';
                if (r.risk_level === 'High') return '#F44336';
                return '#FFEB3B'; 
            }),
            borderWidth: 1,
        }]
    };

    let dominantInsight = "Insufficient data to generate observations.";
    if (riskDist.length > 0) {
        const total = riskDist.reduce((acc, r) => acc + r.count, 0);
        if (total > 0) {
            const highest = [...riskDist].sort((a,b) => b.count - a.count)[0];
            dominantInsight = `Observation: The majority of assigned students (${highest.count} out of ${total}) are categorized as ${highest.risk_level} Risk.`;
        }
    }

    return (
        <div className="admin-prediction fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Faculty Prediction & AI Insights</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontWeight: 'bold' }}>Faculty Mentor:</label>
                    <select 
                        value={selectedFaculty} 
                        onChange={handleFacultyChange}
                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: '250px', background: 'var(--card-bg)', color: 'var(--text-main)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                        {faculties.map(f => (
                            <option key={f.user_id} value={f.user_id}>{f.first_name} {f.last_name} ({f.department || 'ECE'})</option>
                        ))}
                    </select>
                </div>
            </div>

            {fetchingInsights ? (
                <div style={{textAlign: 'center', padding: '100px'}}>
                    <div className="loader" style={{border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px'}}></div>
                    <p style={{color: 'var(--text-muted)'}}>AI Engine Processing Forecasts...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : insights ? (
                insights.totalAssigned === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
                        <h2>No Students Assigned</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                           This faculty member does not have any students assigned. Please map students in the <strong>Assign Students</strong> module.
                        </p>
                    </div>
                ) : (
                <>
                    {/* ... (Metrics Bar remains the same) ... */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="metric-card" style={{ flex: 1, background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '5px solid var(--primary)' }}>
                            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Predicted GPA</p>
                            <h2 style={{ margin: '0.5rem 0', fontSize: '2.4rem', color: 'var(--primary)' }}>{insights.averagePredictedGpa}</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aggregate forecast for semester</p>
                        </div>
                        <div className="metric-card" style={{ flex: 1, background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '5px solid #673AB7' }}>
                            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Student Count</p>
                            <h2 style={{ margin: '0.5rem 0', fontSize: '2.4rem', color: '#673AB7' }}>{insights.totalAssigned}</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned mentees</p>
                        </div>
                        <div className="metric-card" style={{ flex: 1, background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '5px solid #FF9800' }}>
                            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Last Updated</p>
                            <h2 style={{ margin: '0.5rem 0', fontSize: '2rem', color: '#FF9800', paddingTop: '0.4rem' }}>{insights.lastUpdated || 'Just now'}</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time sync enabled</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Distribution Chart */}
                        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Risk Distribution</h3>
                            <div style={{ height: '280px' }}>
                                <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                            </div>
                        </div>

                        {/* AI Insights Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>✨ AI Analytics & Insights</h3>
                            
                            <div style={{ background: 'var(--card-bg)', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #F44336', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 0.4rem 0', color: '#F44336', fontSize: '1rem' }}>Risk Summary</h4>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                    <strong>{insights.aiInsights?.riskSummary?.highRiskPercentage}%</strong> of students are currently in the High Risk category. 
                                    Primary concern: <span style={{ color: '#F44336', fontWeight: 'bold' }}>{insights.aiInsights?.riskSummary?.mainFactor}</span>.
                                </p>
                            </div>

                            <div style={{ background: 'var(--card-bg)', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #2196F3', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 0.4rem 0', color: '#2196F3', fontSize: '1rem' }}>Subject-Wise Insights</h4>
                                <div style={{ fontSize: '0.95rem' }}>
                                    <div style={{ marginBottom: '0.3rem' }}>🔴 Most Difficult: <strong>{insights.aiInsights?.subjectInsights?.difficult}</strong></div>
                                    <div>🟢 Highest Scoring: <strong>{insights.aiInsights?.subjectInsights?.scoring}</strong></div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--card-bg)', padding: '1.2rem', borderRadius: '10px', borderLeft: '5px solid #4CAF50', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 0.4rem 0', color: '#4CAF50', fontSize: '1rem' }}>Performance Trend</h4>
                                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                                    Overall student performance is currently <strong style={{color: insights.aiInsights?.performanceTrend === 'Declining' ? '#F44336' : '#4CAF50'}}>{insights.aiInsights?.performanceTrend}</strong> compared to previous semester entry GPA.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                             High-Risk Focus List ({highRiskStudents.length})
                        </h3>
                        {highRiskStudents.length > 0 ? (
                            <div className="table-responsive">
                                <table className="custom-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{background: 'var(--input-bg)', borderBottom: '2px solid var(--border-color)'}}>
                                            <th style={{padding: '12px', textAlign: 'left'}}>Register Number</th>
                                            <th style={{padding: '12px', textAlign: 'left'}}>Name</th>
                                            <th style={{padding: '12px', textAlign: 'center'}}>Predicted GPA</th>
                                            <th style={{padding: '12px', textAlign: 'center'}}>Primary Risk Factor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {highRiskStudents.map((s, idx) => (
                                            <tr key={idx} style={{borderBottom: '1px solid var(--border-color)'}}>
                                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.register_number}</td>
                                                <td style={{ padding: '12px' }}>{s.name}</td>
                                                <td style={{ padding: '12px', textAlign: 'center', color: '#F44336', fontWeight: 'bold' }}>{s.predictedGPA}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}><span className="risk-pill high">{s.reason}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <p>✅ No high-risk students found for this faculty selection.</p>
                            </div>
                        )}
                    </div>
                </>
                )
            ) : (
                <div style={{textAlign: 'center', padding: '100px', color: 'var(--text-muted)'}}>
                    <i className="material-icons" style={{fontSize: '48px', marginBottom: '10px'}}>smart_toy</i>
                    <p>Select a faculty mentor to analyze their academic forecasts.</p>
                </div>
            )}

            <div style={{marginTop: '40px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)'}}>
                <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i className="material-icons" style={{fontSize: '18px'}}>info_outline</i>
                    <strong>Prediction Insight:</strong> Faculty-aggregated insights are updated dynamically as students' internal marks and attendance are recorded. The AI engine refreshes assessments every time a significant performance delta is detected.
                </p>
            </div>
        </div>
    );
};

export default AdminPredictionInsights;
