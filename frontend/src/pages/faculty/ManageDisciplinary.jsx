import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ManageDisciplinary() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ student_id: '', issue_type: 'Exam Malpractice', description: '', date: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/students').then(res => setStudents(res.data)).catch(console.error);
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/disciplinary', formData);
      setMessage('Disciplinary action recorded.');
      setFormData({ ...formData, description: '' }); // reset only description
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="card" style={{ borderColor: 'var(--danger)' }}>
      <h2 className="card-title text-danger">Log Disciplinary Action</h2>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>Warning: Adding malpractice records severely impacts the student's Prediction Risk level.</p>
      
      {message && <div style={{ padding: '1rem', background: '#FEE2E2', color: '#991B1B', marginBottom: '1rem', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
        <div className="form-group">
          <label>Select Student</label>
          <select 
            className="form-control" 
            value={formData.student_id} 
            onChange={e => setFormData({...formData, student_id: e.target.value})}
            required
          >
            <option value="">-- Choose Student --</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.register_number})</option>)}
          </select>
        </div>
        
        <div className="form-group">
          <label>Issue Type</label>
          <select 
            className="form-control" 
            value={formData.issue_type} 
            onChange={e => setFormData({...formData, issue_type: e.target.value})}
          >
            <option value="Exam Malpractice">Exam Malpractice</option>
            <option value="Cheating in Test">Cheating in Test</option>
            <option value="Unfair Academic Behaviour">Unfair Academic Behaviour</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Remarks / Description</label>
          <textarea 
            className="form-control" 
            rows="4"
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--danger)' }}>Log Infraction</button>
      </form>
    </div>
  );
}

export default ManageDisciplinary;
