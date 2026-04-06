import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminForms.css';

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [courseCode, setCourseCode] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data);
        } catch (e) {
            toast.error('Failed to load subjects');
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await api.put(`/subjects/${editingId}`, { course_code: courseCode, subject_name: subjectName });
                toast.success('Subject updated successfully!');
                setEditingId(null);
            } else {
                await api.post('/subjects', { course_code: courseCode, subject_name: subjectName });
                toast.success('Subject created successfully!');
            }
            setCourseCode('');
            setSubjectName('');
            fetchSubjects(); // refresh list
        } catch (err) {
            toast.error(err.response?.data?.error || (editingId ? 'Failed to update subject' : 'Failed to create subject'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setEditingId(subject.id);
        setCourseCode(subject.course_code || '');
        setSubjectName(subject.subject_name);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setCourseCode('');
        setSubjectName('');
    };

    return (
        <div className="admin-grid-layout fade-in">
            <div className="admin-form-container">
                <div className="form-header">
                    <h2>{editingId ? 'Edit Subject' : 'Create New Subject'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="complex-form">
                    <div className="form-group full">
                        <label>Course Code *</label>
                        <input 
                            type="text" 
                            value={courseCode} 
                            onChange={e => setCourseCode(e.target.value)} 
                            required 
                            placeholder="e.g. CS101"
                        />
                    </div>
                    <div className="form-group full">
                        <label>Subject Name *</label>
                        <input 
                            type="text" 
                            value={subjectName} 
                            onChange={e => setSubjectName(e.target.value)} 
                            required 
                            placeholder="e.g. Introduction to Programming"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Subject' : 'Create Subject')}
                        </button>
                        {editingId && (
                            <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={loading} style={{marginLeft: '10px'}}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="admin-list-container">
                 <div className="form-header">
                    <h2>Existing Subjects</h2>
                </div>
                {subjects.length === 0 ? (
                    <p className="no-data">No subjects found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Course Code</th>
                                        <th>Subject Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...subjects].sort((a,b) => (a.course_code || '').localeCompare(b.course_code || '')).map(s => (
                                        <tr key={s.id}>
                                            <td>{s.id}</td>
                                            <td><strong>{s.course_code || 'N/A'}</strong></td>
                                            <td>{s.subject_name}</td>
                                            <td>
                                                <button className="btn btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageSubjects;
