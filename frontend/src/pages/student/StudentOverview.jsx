import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './StudentOverview.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StudentOverview() {
  const [profile, setProfile] = useState(null);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [disciplinary, setDisciplinary] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profRes, marksRes, attRes, discRes, predRes, trendRes] = await Promise.all([
            api.get(`/students/${studentId}`),
            api.get(`/marks/${studentId}`),
            api.get(`/attendance/${studentId}`),
            api.get(`/disciplinary/${studentId}`),
            api.get(`/predict/history/${studentId}`),
            api.get(`/students/${studentId}/performance-trend`)
        ]);

        setProfile(profRes.data);
        setMarks(marksRes.data);
        setAttendance(attRes.data);
        setDisciplinary(discRes.data);
        setPredictionHistory(predRes.data);
        setPerformanceTrend(trendRes.data || []);

        setLoading(false);
      } catch (err) {
        console.error("Failed fetching dashboard data", err);
        setLoading(false);
      }
    };
    
    if (studentId) fetchAllData();
  }, [studentId]);

  if (loading) return <div className="loading">Loading your academic dashboard...</div>;

  const getBadgeClass = (level) => {
    if (level === 'Excellent') return 'badge-excellent';
    if (level === 'Good') return 'badge-good';
    if (level === 'Average') return 'badge-warning';
    if (level === 'At Risk') return 'badge-danger';
    return '';
  };

  const latestPrediction = predictionHistory.length > 0 ? predictionHistory[0] : null;

  const getOverallStatus = () => {
    if (!latestPrediction) return { label: 'Neutral', color: '#9E9E9E', icon: 'info' };
    const risk = latestPrediction.risk_score_percentage || 0;
    const gpa = parseFloat(latestPrediction.predicted_gpa) || 0;

    if (risk > 40 || gpa < 6.0) return { label: 'At Risk', color: 'var(--risk-high)', icon: 'warning' };
    if (gpa > 8.0 && risk < 15) return { label: 'Excellent', color: 'var(--risk-low)', icon: 'stars' };
    return { label: 'Moderate', color: 'var(--risk-medium)', icon: 'trending_up' };
  };

  const overallStatus = getOverallStatus();
  const riskColor = latestPrediction?.risk_level?.includes('High') ? 'var(--risk-high)' : 
                    latestPrediction?.risk_level?.includes('Medium') ? 'var(--risk-medium)' : 'var(--risk-low)';

  // Chart configs
  const marksChartData = {
      labels: marks.map(m => m.subject_name.substring(0, 15) + '...'),
      datasets: [
          {
              label: 'Internal Marks / 100',
              data: marks.map(m => m.internal_mark),
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              borderWidth: 2,
              tension: 0.3
          }
      ]
  };

  const attendanceChartData = {
      labels: attendance.map(a => a.subject_name.substring(0, 15) + '...'),
      datasets: [
          {
              label: 'Attendance %',
              data: attendance.map(a => ((a.classes_attended/a.total_classes)*100).toFixed(0)),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderWidth: 2,
              tension: 0.3
          }
      ]
  };

  return (
    <div className="view-container fade-in" style={{ paddingBottom: '40px' }}>
      {/* 1. Refined Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
        <h2 style={{margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '850', letterSpacing: '-0.5px'}}>Dashboard Overview</h2>
        <div className="glass-badge" style={{
            background: 'rgba(79, 70, 229, 0.08)', 
            padding: '6px 16px', 
            borderRadius: '30px', 
            border: '1px solid rgba(79, 70, 229, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            <i className="material-icons" style={{fontSize: '16px'}}>auto_awesome</i>
            AI Insights Active
        </div>
      </div>
      
      {/* 2. Professional Profile Banner */}
      {profile && (
          <div className="profile-banner fade-in-up">
              <div style={{position: 'relative', zIndex: 3, width: '100%'}}>
                  <h3 style={{margin: 0}}>Welcome back, {profile.name}!</h3>
                  <p>Here's your academic performance summary for Semester {profile.semester || 6}.</p>
                  
                  <div className="profile-grid">
                      <div className="profile-item">
                          <label>Registration</label>
                          <span>{profile.register_number}</span>
                      </div>
                      <div className="profile-item">
                          <label>Department</label>
                          <span>{profile.department}</span>
                      </div>
                      <div className="profile-item">
                          <label>Current Status</label>
                          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                              <i className="material-icons" style={{fontSize: '16px', color: overallStatus.color}}>{overallStatus.icon}</i>
                              <span style={{color: 'white'}}>{overallStatus.label}</span>
                          </span>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Modern Stat Cards */}
      <div className="stats-cards" style={{ marginBottom: '35px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        <div className="modern-stat-card fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="modern-stat-icon" style={{ color: riskColor, background: `${riskColor}15` }}>
            <i className="material-icons">{latestPrediction?.risk_level?.includes('High') ? 'priority_high' : 'verified'}</i>
          </div>
          <div className="modern-stat-info">
            <h3>Academic Risk</h3>
            <h2>
                {latestPrediction?.risk_level || 'Safe'} 
                <span style={{fontSize:'0.9rem', opacity:0.6, fontWeight:'600', marginLeft: '6px'}}>({latestPrediction?.risk_score_percentage || 0}%)</span>
            </h2>
          </div>
        </div>

        <div className="modern-stat-card fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="modern-stat-icon" style={{ color: '#4F46E5', background: 'rgba(79, 70, 229, 0.1)' }}>
            <i className="material-icons">query_stats</i>
          </div>
          <div className="modern-stat-info">
            <h3>Forecasted GPA</h3>
            <h2>{latestPrediction?.predicted_gpa || '0.00'}</h2>
          </div>
        </div>

        <div className="modern-stat-card fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="modern-stat-icon" style={{ color: '#9C27B0', background: 'rgba(156, 39, 176, 0.1)' }}>
             <i className="material-icons">pie_chart_outline</i>
          </div>
          <div className="modern-stat-info">
            <h3>Attendance Rank</h3>
            <h2>
                {attendance.length > 0 ? 
                    (attendance.reduce((sum, a) => sum + (parseFloat(a.percentage) || 0), 0) / attendance.length).toFixed(0) : '0'}%
            </h2>
          </div>
        </div>
      </div>

      {/* 4. Semester Trend Chart */}
      <div className="chart-card fade-in-up" style={{marginBottom: '30px', animationDelay: '0.4s'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px'}}>
              <h3 style={{margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <i className="material-icons" style={{color: '#9C27B0'}}>timeline</i>
                  GPA Progression Trend
              </h3>
              <span className="badge badge-info">Semester-wise</span>
          </div>
          {performanceTrend.length > 0 ? (
              <div style={{height: '350px'}}>
                  <Line 
                    data={{
                        labels: performanceTrend.map(t => `Sem ${t.semester}`),
                        datasets: [{
                            label: 'GPA',
                            data: performanceTrend.map(t => parseFloat(t.gpa)),
                            borderColor: '#4F46E5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            pointBackgroundColor: '#4F46E5',
                            pointBorderColor: 'white',
                            pointBorderWidth: 2
                        }]
                    }} 
                    options={{
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false }, tooltip: { padding: 12, borderRadius: 10 } },
                        scales: {
                            y: { beginAtZero: false, min: 4.0, max: 10.0, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { stepSize: 1 } },
                            x: { grid: { display: false } }
                        }
                    }} 
                  />
              </div>
          ) : <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>No historical performance data available.</div>}
      </div>

      {/* 5. Subject Analysis Charts */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px'}}>
          
          <div className="chart-card fade-in-up" style={{animationDelay: '0.5s'}}>
              <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-main)'}}>Subject-Wise Marks</h3>
              {marks.length > 0 ? (
                  <div style={{height: '280px'}}>
                      <Line data={marksChartData} options={{
                          responsive: true, 
                          maintainAspectRatio: false, 
                          plugins: { legend: { display: false } },
                          scales: {y: {beginAtZero: true, max: 100, grid: {color: 'rgba(0,0,0,0.03)'}}}
                        }} 
                      />
                  </div>
              ) : <p className="text-muted text-center" style={{paddingTop: '20px'}}>No marks published yet.</p>}
          </div>

          <div className="chart-card fade-in-up" style={{animationDelay: '0.6s'}}>
              <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-main)'}}>Attendance Analysis</h3>
              {attendance.length > 0 ? (
                  <div style={{height: '280px'}}>
                      <Line data={attendanceChartData} options={{
                          responsive: true, 
                          maintainAspectRatio: false, 
                          plugins: { legend: { display: false } },
                          scales: {y: {beginAtZero: true, max: 100, grid: {color: 'rgba(0,0,0,0.03)'}}}
                        }} 
                      />
                  </div>
              ) : <p className="text-muted text-center" style={{paddingTop: '20px'}}>No attendance logged yet.</p>}
          </div>

      </div>

      <div style={{marginTop: '40px', padding: '20px', background: 'var(--card-bg)', borderRadius: '15px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '15px'}}>
          <div style={{background: 'rgba(79, 70, 229, 0.1)', padding: '10px', borderRadius: '12px'}}>
              <i className="material-icons" style={{color: 'var(--primary)'}}>tips_and_updates</i>
          </div>
          <div>
              <h4 style={{margin: '0 0 5px 0', color: 'var(--text-main)'}}>AI Insight Disclaimer</h4>
              <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5'}}>
                  Predictions are calculated using weightage from internal assessments, cumulative attendance, and historical trends. 
                  This is a forecasting tool intended to help you proactively manage your academic goals.
              </p>
          </div>
      </div>
    </div>
  );
}

export default StudentOverview;
