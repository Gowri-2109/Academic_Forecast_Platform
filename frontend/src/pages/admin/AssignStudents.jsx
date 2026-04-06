import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminForms.css';

const AssignStudents = () => {
    const [faculties, setFaculties] = useState([]);
    const [students, setStudents] = useState([]);
    
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [facRes, stuRes] = await Promise.all([
                    api.get('/faculties'),
                    api.get('/students')
                ]);
                
                // Filter out already assigned students (faculty_id is NULL)
                const unassignedStudents = stuRes.data.filter(s => s.faculty_id === null || s.faculty_id === undefined);
                
                setFaculties(facRes.data);
                setStudents(unassignedStudents);
            } catch (e) {
                toast.error('Failed to load data for assignments.');
            }
        };
        fetchInitialData();
    }, []);

    const handleStudentToggle = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(students.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFaculty) return toast.error('Please select a faculty member.');
        if (selectedStudents.length === 0) return toast.error('Please select at least one student.');

        setLoading(true);
        try {
            await api.post('/student-assignments/assign', {
                faculty_id: selectedFaculty,
                student_ids: selectedStudents
            });
            toast.success(`Successfully assigned ${selectedStudents.length} students securely!`);
            // Remove newly assigned students from the list
            setStudents(students.filter(s => !selectedStudents.includes(s.id)));
            setSelectedFaculty('');
            setSelectedStudents([]);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to assign students');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-container fade-in" style={{maxWidth: '1000px'}}>
             <div className="form-header">
                <h2>Assign Students to Faculty</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="complex-form">
                <div className="form-group full">
                    <label>Select Faculty Component *</label>
                    <select 
                        value={selectedFaculty} 
                        onChange={(e) => setSelectedFaculty(e.target.value)} 
                        required
                        className="large-select"
                    >
                        <option value="">-- Choose a Faculty --</option>
                        {faculties.map(f => (
                            <option key={f.user_id} value={f.user_id}>
                                {f.first_name ? `${f.first_name} ${f.last_name}` : f.name} - {f.department || 'No Dept'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="students-selection-box">
                    <div className="selection-header">
                        <label>Select Students to Assigned</label>
                        <div className="select-all">
                            <input 
                                type="checkbox" 
                                id="selectAll"
                                checked={selectedStudents.length === students.length && students.length > 0}
                                onChange={handleSelectAll}
                            />
                            <label htmlFor="selectAll">Select All</label>
                        </div>
                    </div>
                    
                    <div className="students-checkbox-grid">
                        {students.map(s => (
                            <div key={s.id} className={`student-check-item ${selectedStudents.includes(s.id) ? 'selected' : ''}`}>
                                <input 
                                    type="checkbox" 
                                    id={`stu-${s.id}`}
                                    checked={selectedStudents.includes(s.id)}
                                    onChange={() => handleStudentToggle(s.id)}
                                />
                                <label htmlFor={`stu-${s.id}`}>
                                    <strong>{s.register_number}</strong><br/>
                                    {s.name} ({s.department || 'N/A'})
                                </label>
                            </div>
                        ))}
                        {students.length === 0 && <p style={{gridColumn: '1/-1', textAlign:'center', color:'#888'}}>No students available.</p>}
                    </div>
                </div>

                <div className="form-actions" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                    <span className="selection-count">
                        {selectedStudents.length} student(s) selected
                    </span>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignStudents;
