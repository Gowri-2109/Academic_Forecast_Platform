import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FacultyViews.css';
import { toast } from 'react-toastify';

const StudentQueries = () => {
    const facultyId = localStorage.getItem('userId');
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending');
    const [replyText, setReplyText] = useState({});
    const [isSubmitting, setIsSubmitting] = useState({});

    useEffect(() => {
        if (facultyId) fetchStudentQueries();
    }, [facultyId]);

    const fetchStudentQueries = async () => {
        try {
            const res = await api.get(`/queries/faculty/${facultyId}`);
            setQueries(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load student queries");
        } finally {
            setLoading(false);
        }
    };

    const handleReplyChange = (queryId, value) => {
        setReplyText(prev => ({ ...prev, [queryId]: value }));
    };

    const handleSubmitReply = async (queryId) => {
        const message = replyText[queryId];
        if (!message || !message.trim()) {
            toast.warn("Please enter a reply message");
            return;
        }

        setIsSubmitting(prev => ({ ...prev, [queryId]: true }));
        try {
            await api.put(`/queries/${queryId}`, {
                status: 'Completed',
                admin_reply: message 
            });
            toast.success("Reply sent and query resolved");
            setReplyText(prev => ({ ...prev, [queryId]: '' }));
            fetchStudentQueries();
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit reply");
        } finally {
            setIsSubmitting(prev => ({ ...prev, [queryId]: false }));
        }
    };

    const filteredQueries = queries.filter(q => q.status === activeTab);

    return (
        <div className="view-container fade-in">
            <h2 style={{marginTop: 0, marginBottom: '25px', color: 'var(--primary)'}}>Student Queries & Feedback</h2>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <button 
                    onClick={() => setActiveTab('Pending')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'Pending' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'Pending' ? 'white' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Pending Queries ({queries.filter(q => q.status === 'Pending').length})
                </button>
                <button 
                    onClick={() => setActiveTab('Completed')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'Completed' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'Completed' ? 'white' : 'var(--text-muted)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Completed ({queries.filter(q => q.status === 'Completed').length})
                </button>
            </div>

            <div className="queries-list-container">
                {loading ? (
                    <div style={{textAlign: 'center', padding: '50px'}}>
                        <div className="loader">Loading...</div>
                    </div>
                ) : filteredQueries.length > 0 ? (
                    <div style={{display: 'grid', gap: '25px'}}>
                        {filteredQueries.map(q => (
                            <div key={q.id} className="card" style={{
                                background: 'var(--card-bg)', 
                                padding: '25px', 
                                borderRadius: '15px', 
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                borderLeft: `6px solid ${q.status === 'Completed' ? '#2ecc71' : '#f1c40f'}`,
                                position: 'relative'
                            }}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                                    <div>
                                        <h4 style={{margin: '0 0 5px 0', fontSize: '1.2rem'}}>{q.user_name}</h4>
                                        <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                                            {new Date(q.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className={`badge ${q.status === 'Completed' ? 'badge-success' : 'badge-warning'}`} style={{padding: '6px 12px', borderRadius: '20px'}}>
                                        {q.status}
                                    </span>
                                </div>

                                <div style={{background: 'rgba(0,0,0,0.02)', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontStyle: 'italic', borderLeft: '3px solid var(--border-color)'}}>
                                    "{q.message}"
                                </div>

                                {q.status === 'Completed' ? (
                                    <div style={{background: '#e8f5e9', padding: '15px', borderRadius: '10px', marginTop: '10px'}}>
                                        <p style={{margin: '0 0 5px 0', fontWeight: 'bold', color: '#2e7d32'}}>Your Resolution:</p>
                                        <p style={{margin: 0}}>{q.admin_reply}</p>
                                    </div>
                                ) : (
                                    <div className="reply-section" style={{marginTop: '15px'}}>
                                        <label style={{display: 'block', marginBottom: '10px', fontWeight: '500'}}>Respond to Student:</label>
                                        <textarea 
                                            value={replyText[q.id] || ''}
                                            onChange={(e) => handleReplyChange(q.id, e.target.value)}
                                            placeholder="Write your resolution/reply here..."
                                            rows="3"
                                            style={{
                                                width: '100%', 
                                                padding: '12px', 
                                                borderRadius: '8px', 
                                                border: '1px solid var(--border-color)',
                                                resize: 'vertical',
                                                marginBottom: '15px',
                                                background: 'var(--bg-color)',
                                                color: 'var(--text-main)'
                                            }}
                                        />
                                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => handleSubmitReply(q.id)}
                                                disabled={isSubmitting[q.id]}
                                            >
                                                {isSubmitting[q.id] ? 'Submitting...' : 'Resolve Query'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{padding: '50px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '15px'}}>
                        <i className="material-icons" style={{fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '15px'}}>inbox</i>
                        <h3 style={{color: 'var(--text-muted)'}}>No {activeTab.toLowerCase()} queries.</h3>
                        <p style={{color: 'var(--text-muted)'}}>Everything is caught up in this category!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentQueries;
