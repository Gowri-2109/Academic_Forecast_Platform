import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FacultyViews.css';
import { toast } from 'react-toastify';

const AssignmentsPage = () => {
    const userId = localStorage.getItem('userId');
    const [activeTab, setActiveTab] = useState('add'); // add, pending, completed
    
    // Data States
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [materials, setMaterials] = useState('');
    const [submissionType, setSubmissionType] = useState('softcopy');
    const [maxSizeMb, setMaxSizeMb] = useState('');
    const [fileFormat, setFileFormat] = useState('regno_name');
    const [deadline, setDeadline] = useState('');
    const [maxMarks, setMaxMarks] = useState('100');
    const [assignToAll, setAssignToAll] = useState(true);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    
    // View States
    const [viewingAssignmentStatus, setViewingAssignmentStatus] = useState(null);
    const [assignmentStatusList, setAssignmentStatusList] = useState([]);
    const [editingDeadlineId, setEditingDeadlineId] = useState(null);
    const [newDeadline, setNewDeadline] = useState('');

    useEffect(() => {
        if (userId) {
            fetchStudents();
            fetchAssignments();
        }
    }, [userId]);

    const fetchStudents = async () => {
        try {
            const res = await api.get(`/faculties/${userId}/students`);
            setAssignedStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/faculty-assignments/faculty/${userId}`);
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/faculty-assignments', {
                faculty_id: userId,
                title,
                description,
                materials,
                submission_type: submissionType,
                max_size_mb: submissionType === 'softcopy' ? maxSizeMb : null,
                file_format: submissionType === 'softcopy' ? fileFormat : null,
                deadline,
                max_marks: maxMarks,
                assign_to_all: assignToAll,
                student_ids: assignToAll ? [] : selectedStudentIds
            });
            toast.success("Assignment Created and Notifications Sent!");
            // Reset form
            setTitle(''); setDescription(''); setMaterials(''); 
            setDeadline(''); setMaxMarks('100'); setAssignToAll(true); setSelectedStudentIds([]);
            fetchAssignments();
            setActiveTab('pending');
        } catch (err) {
            toast.error("Failed to create assignment");
        }
    };

    const handleDeleteAssignment = async (id) => {
        if(!window.confirm("Are you sure you want to remove this assignment completely?")) return;
        try {
            await api.delete(`/faculty-assignments/${id}`);
            toast.success('Assignment Removed');
            fetchAssignments();
            if(viewingAssignmentStatus && viewingAssignmentStatus.id === id) setViewingAssignmentStatus(null);
        } catch (err) {
            toast.error("Failed to remove assignment");
        }
    };

    const handleUpdateDeadline = async (id) => {
        try {
            await api.put(`/faculty-assignments/${id}/deadline`, { deadline: newDeadline });
            toast.success("Deadline Updated");
            setEditingDeadlineId(null);
            fetchAssignments();
        } catch (err) {
            toast.error("Failed to update deadline");
        }
    };

    const handleViewStatus = async (assignment) => {
        setViewingAssignmentStatus(assignment);
        try {
            const res = await api.get(`/faculty-assignments/${assignment.id}/status`);
            setAssignmentStatusList(res.data);
        } catch (err) {
            toast.error("Failed to load completion status");
        }
    };

    const isPending = (dl) => new Date(dl) >= new Date(new Date().setHours(0,0,0,0));

    const pendingAssignments = assignments.filter(a => isPending(a.deadline));
    const completedAssignments = assignments.filter(a => !isPending(a.deadline));

    return (
        <div className="view-container">
            <h2 style={{marginTop: 0}}>Assignment Management</h2>
            
            <div className="tabs-header" style={{display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px'}}>
                <button 
                    className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {setActiveTab('add'); setViewingAssignmentStatus(null);}}
                >
                    1. Create Assignment
                </button>
                <button 
                    className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {setActiveTab('pending'); setViewingAssignmentStatus(null);}}
                >
                    2. Completion / Pending ({pendingAssignments.length})
                </button>
                <button 
                    className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {setActiveTab('completed'); setViewingAssignmentStatus(null);}}
                >
                    3. Deadline Over ({completedAssignments.length})
                </button>
            </div>

            {/* TAB 1: ADD ASSIGNMENT */}
            {activeTab === 'add' && (
                <div className="form-card" style={{background: 'var(--card-bg)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                    <form onSubmit={handleCreateAssignment}>
                        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px'}}>
                            <div style={{flex: 1, minWidth: '250px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Assignment Title *</label>
                                <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
                            </div>
                            <div style={{flex: 1, minWidth: '250px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Max Marks *</label>
                                <input type="number" value={maxMarks} onChange={e=>setMaxMarks(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
                            </div>
                            <div style={{flex: 1, minWidth: '250px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Deadline *</label>
                                <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} required min={new Date().toISOString().split('T')[0]} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
                            </div>
                        </div>

                        <div style={{marginBottom: '15px'}}>
                            <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Description / Topic (Optional)</label>
                            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows="3" style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}></textarea>
                        </div>

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Materials or Reference Links (Optional)</label>
                            <input type="text" value={materials} onChange={e=>setMaterials(e.target.value)} placeholder="e.g. Chapter 4 PDF link, Google Drive link" style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
                        </div>

                        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', background: 'var(--table-header-bg, var(--input-bg))', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                            <div style={{flex: 1, minWidth: '200px'}}>
                                <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Submission Type</label>
                                <select value={submissionType} onChange={e=>setSubmissionType(e.target.value)} style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}}>
                                    <option value="softcopy">Softcopy (Online Upload)</option>
                                    <option value="hardcopy">Hardcopy (Physical Hand-in)</option>
                                    <option value="hardware">Hardware / Project Demo</option>
                                </select>
                            </div>

                            {submissionType === 'softcopy' && (
                                <>
                                    <div style={{flex: 1, minWidth: '200px'}}>
                                        <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Max File Size (MB)</label>
                                        <input type="number" value={maxSizeMb} onChange={e=>setMaxSizeMb(e.target.value)} placeholder="e.g. 10" style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
                                    </div>
                                    <div style={{flex: 1, minWidth: '200px'}}>
                                        <label style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Required File Naming Format</label>
                                        <input type="text" value={fileFormat} onChange={e=>setFileFormat(e.target.value)} placeholder="e.g. regno_name" style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)'}} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{marginBottom: '20px'}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500', cursor: 'pointer'}}>
                                <input type="checkbox" checked={assignToAll} onChange={e => setAssignToAll(e.target.checked)} style={{width: '20px', height: '20px'}} />
                                Assign to ALL my students
                            </label>
                            
                            {!assignToAll && (
                                <div style={{marginTop: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px'}}>
                                    {assignedStudents.map(s => (
                                        <label key={s.id} style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedStudentIds.includes(s.id)}
                                                onChange={(e) => {
                                                    if(e.target.checked) setSelectedStudentIds([...selectedStudentIds, s.id])
                                                    else setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id))
                                                }}
                                            />
                                            {s.register_number} - {s.name}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <button type="submit" className="btn btn-primary" style={{padding: '12px 30px', fontSize: '1.1rem'}}>Upload Assignment</button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABS 2 & 3: ASSIGNMENT LISTS */}
            {(activeTab === 'pending' || activeTab === 'completed') && (
                <div>
                    {!viewingAssignmentStatus ? (
                        <div className="table-wrapper" style={{background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                            <table className="data-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead>
                                    <tr style={{background: 'var(--table-header-bg, var(--input-bg))', borderBottom: '2px solid var(--border-color)'}}>
                                        <th style={{padding: '15px', textAlign: 'left'}}>Title</th>
                                        <th style={{padding: '15px', textAlign: 'left'}}>Type</th>
                                        <th style={{padding: '15px', textAlign: 'left'}}>Deadline</th>
                                        <th style={{padding: '15px', textAlign: 'center'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'pending' ? pendingAssignments : completedAssignments).map(a => (
                                        <tr key={a.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                            <td style={{padding: '15px', fontWeight: '500'}}>{a.title}</td>
                                            <td style={{padding: '15px', textTransform: 'capitalize'}}>{a.submission_type}</td>
                                            <td style={{padding: '15px'}}>
                                                {editingDeadlineId === a.id ? (
                                                    <div style={{display: 'flex', gap: '5px'}}>
                                                        <input type="date" value={newDeadline} onChange={e=>setNewDeadline(e.target.value)} />
                                                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateDeadline(a.id)}>Save</button>
                                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingDeadlineId(null)}>X</button>
                                                    </div>
                                                ) : (
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                        {new Date(a.deadline).toLocaleDateString()}
                                                        {activeTab === 'pending' && (
                                                            <i className="material-icons" style={{fontSize: '16px', cursor: 'pointer', color: '#1976d2'}} title="Edit Deadline" onClick={() => {setEditingDeadlineId(a.id); setNewDeadline(a.deadline.split('T')[0])}}>edit</i>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{padding: '15px', textAlign: 'center'}}>
                                                <button className="btn btn-sm btn-outline" style={{marginRight: '10px'}} onClick={() => handleViewStatus(a)}>View Submissions</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAssignment(a.id)}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(activeTab === 'pending' ? pendingAssignments : completedAssignments).length === 0 && (
                                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>No assignments found in this category.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="status-view" style={{background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px'}}>
                                <div>
                                    <h3 style={{margin: '0 0 5px 0'}}>{viewingAssignmentStatus.title}</h3>
                                    <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Deadline: {new Date(viewingAssignmentStatus.deadline).toLocaleDateString()}</span>
                                </div>
                                <button className="btn btn-secondary" onClick={() => setViewingAssignmentStatus(null)}>Back to List</button>
                            </div>

                            <table className="data-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead>
                                    <tr style={{background: 'var(--table-header-bg, var(--input-bg))', borderBottom: '2px solid var(--border-color)'}}>
                                        <th style={{padding: '15px', textAlign: 'left'}}>Student Name</th>
                                        <th style={{padding: '15px', textAlign: 'left'}}>Reg No</th>
                                        <th style={{padding: '15px', textAlign: 'left'}}>Status</th>
                                        <th style={{padding: '15px', textAlign: 'left'}}>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignmentStatusList.map(s => (
                                        <tr key={s.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                            <td style={{padding: '15px'}}>{s.student_name}</td>
                                            <td style={{padding: '15px'}}>{s.register_number}</td>
                                            <td style={{padding: '15px'}}>
                                                <span className={`badge ${s.status === 'Submitted' ? 'badge-success' : s.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td style={{padding: '15px'}}>{s.score} / {viewingAssignmentStatus.max_marks}</td>
                                        </tr>
                                    ))}
                                    {assignmentStatusList.length === 0 && (
                                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px', color: 'var(--text-muted)'}}>No students assigned to this task.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignmentsPage;
