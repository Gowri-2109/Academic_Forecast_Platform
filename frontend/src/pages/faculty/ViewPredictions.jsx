import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ViewPredictions() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/students').then(res => setStudents(res.data)).catch(console.error);
  }, []);

  const generatePrediction = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const res = await api.get(`/predict/${selectedStudent}`);
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (level) => {
    if (level === 'Excellent') return 'badge-excellent';
    if (level === 'Good') return 'badge-good';
    if (level === 'Average') return 'badge-average';
    if (level === 'At Risk') return 'badge-risk';
    return '';
  };

  return (
    <div>
      <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>AI Academic Forecast</h2>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <p>Select a student to run the prediction engine based on their current records.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <select 
            className="form-control" 
            style={{ maxWidth: '300px' }}
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Choose Student --</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.register_number})</option>)}
          </select>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={generatePrediction} disabled={!selectedStudent || loading}>
            {loading ? 'Analyzing...' : 'Generate AI Forecast'}
          </button>
        </div>
      </div>

      {prediction && (
        <div className="card slide-up-1">
          <h3 className="card-title">Prediction Results</h3>
          <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
            
            <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Performance Level</h4>
              <span className={`badge ${getBadgeClass(prediction.performance_level)}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                {prediction.performance_level}
              </span>
            </div>

            <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Identified Risks</h4>
              {prediction.risk_level === 'No Risk' ? (
                <span className="text-success" style={{ fontWeight: '600' }}>✓ No Risks Detected</span>
              ) : (
                <span className="text-danger" style={{ fontWeight: '600' }}>⚠ {prediction.risk_level}</span>
              )}
            </div>

            <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Data Factors Evaluated</h4>
              <ul style={{ listStyle: 'none' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Average Marks: <strong>{prediction.metrics.average_marks}</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>• Average Attendance: <strong>{prediction.metrics.average_attendance}%</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>• Disciplinary Records: <strong>{prediction.metrics.malpractice_count}</strong> {prediction.metrics.malpractice_count > 0 && <span className="text-danger">(Malpractice Detected)</span>}</li>
                <li style={{ marginBottom: '0.5rem' }}>• Missing Assignments: <strong>{prediction.metrics.has_missing_assignments ? 'Yes' : 'No'}</strong></li>
              </ul>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPredictions;
