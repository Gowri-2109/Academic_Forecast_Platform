import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ManageAssignments() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ student_id: '', subject_id: '1', status: 'Submitted', score: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/students').then(res => setStudents(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', {
         ...formData,
         score: formData.status === 'Missing' ? 0 : formData.score
      });
      setMessage('Assignment status saved!');
      setFormData({ ...formData, score: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Manage Assignments</h2>
      {message && <div style={{ padding: '1rem', background: '#D1FAE5', color: '#065F46', marginBottom: '1rem', borderRadius: '4px' }}>{message}</div>}
      
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
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        
        <div className="form-group">
          <label>Subject ID</label>
          <input 
            type="number" 
            className="form-control" 
            value={formData.subject_id} 
            onChange={e => setFormData({...formData, subject_id: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select 
            className="form-control" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="Submitted">Submitted</option>
            <option value="Missing">Missing</option>
          </select>
        </div>
        
        {formData.status === 'Submitted' && (
          <div className="form-group">
            <label>Score (Optional)</label>
            <input 
              type="number" 
              className="form-control" 
              value={formData.score} 
              onChange={e => setFormData({...formData, score: e.target.value})}
            />
          </div>
        )}
        
        <button type="submit" className="btn btn-primary">Save Assignment</button>
      </form>
    </div>
  );
}

export default ManageAssignments;
