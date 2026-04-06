import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    register_number: '',
    department: '',
    semester: ''
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      setShowAddForm(false);
      setFormData({ name: '', register_number: '', department: '', semester: '' });
      fetchStudents();
    } catch (err) {
      alert("Failed to add student. Ensure register number is unique.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="card-title">Manage Students</h2>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Add New Student</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Register Number</label>
              <input type="text" name="register_number" className="form-control" value={formData.register_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" className="form-control" value={formData.department} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <input type="number" name="semester" min="1" max="8" className="form-control" value={formData.semester} onChange={handleChange} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn btn-primary">Save Student</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <p>Loading students...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>System Prediction</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.register_number}</td>
                    <td>{s.department}</td>
                    <td>{s.semester}</td>
                    <td>
                      {s.risk_level ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                          <span className={`badge ${s.risk_level === 'High' || s.risk_level === 'Attendance Risk' ? 'badge-danger' : s.risk_level === 'Medium' ? 'badge-warning' : 'badge-excellent'}`}>
                            Risk: {s.risk_level}
                          </span>
                          <span className="badge badge-secondary" style={{fontSize: '0.7rem'}}>
                            Perf: {s.performance_level}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-secondary">Pending AI</span>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageStudents;
