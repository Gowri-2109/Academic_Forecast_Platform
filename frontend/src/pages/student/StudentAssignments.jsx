import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../faculty/FacultyViews.css';
import { toast } from 'react-toastify';

const StudentAssignments = () => {
    const studentId = localStorage.getItem('userId');
    const [activeTab, setActiveTab] = useState('submit'); // submit, pending, completed
    
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchAssignments();
        }
    }, [studentId]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/faculty-assignments/student/${studentId}`);
            setAssignments(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load assignments", err);
            setLoading(false);
        }
    };

    const isPendingDeadline = (dl) => new Date(dl) >= new Date(new Date().setHours(0,0,0,0));

    // Array Separations
    const pendingAssignments = assignments.filter(a => a.status !== 'Submitted');
    const completedAssignments = assignments.filter(a => a.status === 'Submitted');

    const handleSubmission = async (e) => {
        e.preventDefault();
        if(!selectedAssignmentId) {
            toast.error("Please select an assignment first.");
            return;
        }

        if(!submissionFile) {
            toast.error("Please explicitly upload a file document.");
            return;
        }

        try {
            await api.put(`/faculty-assignments/submit/${selectedAssignmentId}/${studentId}`);
            toast.success("Assignment Submitted Successfully!");
            setSelectedAssignmentId('');
            setSubmissionFile(null);
            fetchAssignments();
            setActiveTab('completed');
        } catch (err) {
            toast.error("Failed to submit assignment.");
        }
    };

    return (
        <div className="view-container fade-in">
            {/* Premium Header */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '40px', 
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                padding: '40px',
                borderRadius: '24px',
                color: 'white',
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{zIndex: 1}}>
                    <h2 style={{margin: 0, fontSize: '2.2rem', fontWeight: '800'}}>My Assignments</h2>
                    <p style={{margin: '10px 0 0 0', opacity: 0.9, fontSize: '1.1rem'}}>Manage your submissions and track faculty evaluations</p>
                </div>
                <div style={{background: 'rgba(255,255,255,0.2)', padding: '20px 30px', borderRadius: '20px', backdropFilter: 'blur(10px)', zIndex: 1, textAlign: 'right'}}>
                    <span style={{fontSize: '0.9rem', display: 'block', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>Pending Tasks</span>
                    <strong style={{fontSize: '2rem'}}>{pendingAssignments.length}</strong>
                </div>
                <div style={{position: 'absolute', right: '-30px', top: '-30px', fontSize: '12rem', opacity: 0.1}}>📝</div>
            </div>

            {/* Smart Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '40px', 
                background: 'var(--card-bg)', 
                padding: '10px', 
                borderRadius: '18px',
                width: 'fit-content',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                border: '1px solid var(--border-color)'
            }}>
                <button 
                    className={`nav-tab ${activeTab === 'submit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submit')}
                    style={{
                        padding: '14px 28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: activeTab === 'submit' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'submit' ? 'white' : 'var(--text-muted)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '20px'}}>add_task</i>
                    Submit Work
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                    style={{
                        padding: '14px 28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'pending' ? 'white' : 'var(--text-muted)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '20px'}}>history</i>
                    History ({pendingAssignments.length})
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                    style={{
                        padding: '14px 28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: activeTab === 'completed' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'completed' ? 'white' : 'var(--text-muted)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '20px'}}>verified</i>
                    Evaluated ({completedAssignments.length})
                </button>
            </div>

            {/* Content Sections */}
            <div className="fade-in-up">
                {activeTab === 'submit' && (
                    <div className="form-card" style={{
                        background: 'var(--card-bg)', 
                        padding: '40px', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                        border: '1px solid var(--border-color)',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}>
                        <div style={{marginBottom: '35px', textAlign: 'center'}}>
                            <h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>New Submission</h3>
                            <p style={{color: 'var(--text-muted)'}}>Choose an assignment and upload your work for faculty review.</p>
                        </div>

                        <form onSubmit={handleSubmission}>
                            <div style={{marginBottom: '25px'}}>
                                <label style={{display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)'}}>Target Assignment</label>
                                <select 
                                    className="form-control"
                                    value={selectedAssignmentId} 
                                    onChange={e => setSelectedAssignmentId(e.target.value)} 
                                    required 
                                    style={{
                                        width: '100%', 
                                        padding: '15px', 
                                        borderRadius: '12px', 
                                        border: '2px solid var(--border-color)', 
                                        background: 'var(--input-bg)', 
                                        color: 'var(--text-main)',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <option value="">-- Choose an assignment --</option>
                                    {pendingAssignments.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.title} (Deadline: {new Date(a.deadline).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {selectedAssignmentId && (
                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.05)', 
                                    padding: '25px', 
                                    borderRadius: '16px', 
                                    marginBottom: '30px', 
                                    border: '1px dashed #6366f1'
                                }}>
                                    {pendingAssignments.filter(a => a.id == selectedAssignmentId).map(a => (
                                        <div key={a.id}>
                                            <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                                <div style={{background: 'white', padding: '8px 15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                                    <small style={{display: 'block', opacity: 0.6, fontSize: '0.7rem'}}>Type</small>
                                                    <strong style={{textTransform: 'capitalize'}}>{a.submission_type}</strong>
                                                </div>
                                                <div style={{background: 'white', padding: '8px 15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                                    <small style={{display: 'block', opacity: 0.6, fontSize: '0.7rem'}}>Deadline</small>
                                                    <strong style={{color: !isPendingDeadline(a.deadline) ? 'var(--danger)' : 'inherit'}}>
                                                        {new Date(a.deadline).toLocaleDateString()}
                                                    </strong>
                                                </div>
                                            </div>
                                            <p style={{margin: 0, lineHeight: '1.6'}}><strong>Prompt:</strong> {a.description || 'No description provided.'}</p>
                                            {a.materials && (
                                                <div style={{marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                    <i className="material-icons" style={{fontSize: '20px', color: 'var(--primary)'}}>attachment</i>
                                                    <a href={a.materials} target="_blank" rel="noreferrer" style={{color: 'var(--primary)', fontWeight: '600'}}>Reference Materials</a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{marginBottom: '35px'}}>
                                <label style={{display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)'}}>Upload Document (Max 10MB)</label>
                                
                                {!submissionFile ? (
                                    <div style={{
                                        border: '2px dashed var(--border-color)',
                                        borderRadius: '16px',
                                        padding: '40px',
                                        textAlign: 'center',
                                        background: 'var(--input-bg)',
                                        transition: 'all 0.3s',
                                        position: 'relative'
                                    }}>
                                        <i className="material-icons" style={{fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '15px'}}>cloud_upload</i>
                                        <p style={{margin: 0, color: 'var(--text-muted)'}}>Click to browse or drag and drop files</p>
                                        <input 
                                            id="fileUploadInput"
                                            type="file" 
                                            accept=".pdf,.doc,.docx,.zip,.txt,.jpg,.jpeg,.png,.gif"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 10 * 1024 * 1024) {
                                                        toast.error("File selected is too large! Maximum 10MB.");
                                                        e.target.value = '';
                                                        setSubmissionFile(null);
                                                    } else {
                                                        setSubmissionFile(file);
                                                    }
                                                }
                                            }} 
                                            required 
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                opacity: 0,
                                                cursor: 'pointer'
                                            }} 
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        background: 'var(--card-bg)', 
                                        padding: '20px', 
                                        borderRadius: '16px', 
                                        border: '2px solid var(--primary)',
                                        boxShadow: '0 10px 20px rgba(99, 102, 241, 0.1)'
                                    }}>
                                        <div style={{
                                            width: '50px', 
                                            height: '50px', 
                                            background: '#f1f5f9', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            borderRadius: '12px',
                                            marginRight: '20px'
                                        }}>
                                            <i className="material-icons" style={{color: 'var(--primary)'}}>description</i>
                                        </div>
                                        <div style={{flex: 1}}>
                                            <div style={{fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', wordBreak: 'break-all'}}>{submissionFile.name}</div>
                                            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{(submissionFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setSubmissionFile(null);
                                                const input = document.getElementById('fileUploadInput');
                                                if (input) input.value = '';
                                            }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                border: 'none', 
                                                padding: '10px',
                                                borderRadius: '10px',
                                                color: 'var(--danger)', 
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Remove file"
                                        >
                                            <i className="material-icons" style={{fontSize: '20px'}}>delete</i>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary" style={{
                                width: '100%', 
                                padding: '18px', 
                                borderRadius: '16px', 
                                fontSize: '1.1rem', 
                                fontWeight: '700',
                                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.2)'
                            }}>
                                Submit Assessment for Evaluation
                            </button>
                        </form>
                    </div>
                )}

                {(activeTab === 'pending' || activeTab === 'completed') && (
                    <div className="table-wrapper" style={{
                        background: 'var(--card-bg)', 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{padding: '20px 25px'}}>Assessment / Description</th>
                                    <th style={{padding: '20px 25px'}}>Category</th>
                                    <th style={{padding: '20px 25px'}}>Timeline</th>
                                    <th style={{padding: '20px 25px'}}>Status</th>
                                    <th style={{padding: '20px 25px'}}>Evaluation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center" style={{padding: '50px', color: 'var(--text-muted)'}}>Analyzing records...</td></tr>
                                ) : (activeTab === 'pending' ? pendingAssignments : completedAssignments).length > 0 ? (
                                    (activeTab === 'pending' ? pendingAssignments : completedAssignments).map(a => (
                                        <tr key={a.id} className="hover-row">
                                            <td style={{padding: '20px 25px'}}>
                                                <div style={{fontWeight: '700', fontSize: '1rem', marginBottom: '4px'}}>{a.title}</div>
                                                <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4'}}>{a.description || 'No specific instructions provided.'}</div>
                                            </td>
                                            <td style={{padding: '20px 25px'}}>
                                                <span style={{
                                                    padding: '5px 12px', 
                                                    borderRadius: '8px', 
                                                    background: 'var(--bg-color)', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {a.submission_type}
                                                </span>
                                            </td>
                                            <td style={{padding: '20px 25px'}}>
                                                <div style={{
                                                    color: !isPendingDeadline(a.deadline) && activeTab === 'pending' ? 'var(--danger)' : 'inherit',
                                                    fontWeight: !isPendingDeadline(a.deadline) && activeTab === 'pending' ? '700' : '500'
                                                }}>
                                                    {new Date(a.deadline).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{padding: '20px 25px'}}>
                                                <span className={`risk-pill ${
                                                    a.status === 'Submitted' ? 'low' : !isPendingDeadline(a.deadline) ? 'high' : 'medium'
                                                }`}>
                                                    {a.status === 'Submitted' ? 'Verified' : !isPendingDeadline(a.deadline) ? 'Overdue' : 'Awaiting'}
                                                </span>
                                            </td>
                                            <td style={{padding: '20px 25px'}}>
                                                {a.score !== null ? (
                                                    <div style={{textAlign: 'center'}}>
                                                        <div style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)'}}>{a.score}</div>
                                                        <div style={{fontSize: '0.7rem', opacity: 0.6, fontWeight: '700'}}>SCORE / {a.max_marks}</div>
                                                    </div>
                                                ) : (
                                                    <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center'}}>Pending Review</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="text-center" style={{padding: '100px'}}>
                                        <i className="material-icons" style={{fontSize: '4rem', color: 'var(--border-color)', marginBottom: '20px'}}>assignment_turned_in</i>
                                        <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>No records found in this category.</p>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAssignments;
