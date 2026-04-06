import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './HelpDesk.css';

const HelpDesk = () => {
    const [queries, setQueries] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [targetRole, setTargetRole] = useState('Admin');
    const [activeTab, setActiveTab] = useState('Pending');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role') || 'student'; // used to potentially hide faculty option for faculties

    const fetchData = async () => {
        try {
            const [qRes, nRes] = await Promise.all([
                api.get(`/queries/user/${userId}`),
                api.get(`/notifications/${userId}`)
            ]);
            setQueries(qRes.data);
            setNotifications(nRes.data);
            setLoading(false);
        } catch (e) {
            toast.error('Failed to load helpdesk data.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchData();
    }, [userId]);

    const handleSubmitQuery = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        try {
            await api.post('/queries', { user_id: userId, message: newMessage, target_role: targetRole });
            toast.success(`Your query has been submitted to ${targetRole === 'Admin' ? 'Admin' : 'your Faculty'}!`);
            setNewMessage('');
            fetchData();
        } catch(e) {
            toast.error('Failed to submit query');
        }
    };

    const markNotificationRead = async (id) => {
        try {
             await api.put(`/notifications/${id}/read`);
             fetchData();
        } catch(e) {
             console.error(e);
        }
    };

    return (
        <div className="helpdesk-container fade-in">
            <h2 className="mb-4 text-primary">Help &amp; Support</h2>
            
            <div className="helpdesk-grid">
                {/* Left Column: Submit & History */}
                <div className="helpdesk-main">
                    <div className="card query-form-card">
                        <h3>Ask a Question or Report an Issue</h3>
                        <form onSubmit={handleSubmitQuery}>
                            {String(userRole).toLowerCase() === 'student' && (
                                <div className="form-group mb-3">
                                    <label>Send Query To:</label>
                                    <select 
                                        className="form-control" 
                                        value={targetRole} 
                                        onChange={(e) => setTargetRole(e.target.value)}
                                    >
                                        <option value="Admin">Admin (General/System Issues)</option>
                                        <option value="Faculty">My Faculty (Academic/Class Issues)</option>
                                    </select>
                                </div>
                            )}
                            <textarea 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                                placeholder="Describe your issue or feedback here..."
                                required
                                rows="4"
                                className="form-control"
                            />
                            <button type="submit" className="btn btn-primary mt-3">Submit Query</button>
                        </form>
                    </div>

                    <div className="card mt-4 query-history-card">
                        <h3>Your Recent Queries</h3>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <button 
                                onClick={() => setActiveTab('Pending')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: activeTab === 'Pending' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'Pending' ? 'white' : 'var(--text-muted)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Pending ({queries.filter(q => q.status === 'Pending').length})
                            </button>
                            <button 
                                onClick={() => setActiveTab('Completed')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: activeTab === 'Completed' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'Completed' ? 'white' : 'var(--text-muted)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Completed ({queries.filter(q => q.status === 'Completed').length})
                            </button>
                        </div>
                        {loading ? <p>Loading...</p> : (
                            <div className="query-list">
                                {queries.filter(q => q.status === activeTab).map(q => (
                                    <div key={q.id} className={`query-item ${q.status.toLowerCase()}`}>
                                        <div className="q-header">
                                            <span className="q-date">{new Date(q.created_at).toLocaleString()}</span>
                                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                                <span className="badge badge-info" style={{fontSize: '0.7rem', opacity: 0.8}}>To: {q.target_role}</span>
                                                <span className={`status-badge ${q.status.toLowerCase()}`}>{q.status}</span>
                                            </div>
                                        </div>
                                        <p className="q-message">"{q.message}"</p>
                                        
                                        {q.status === 'Completed' && q.admin_reply && (
                                            <div className="q-reply">
                                                <strong>{q.target_role === 'Faculty' ? 'Faculty Reply:' : 'Admin Reply:'}</strong> {q.admin_reply}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {queries.filter(q => q.status === activeTab).length === 0 && <p className="text-muted">No {activeTab.toLowerCase()} queries found.</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Notifications */}
                <div className="helpdesk-sidebar">
                    <div className="card notification-card">
                        <h3>Notifications</h3>
                        {loading ? <p>Loading...</p> : (
                            <div className="notification-list">
                                {notifications.map(n => (
                                    <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'}`} onClick={() => !n.is_read && markNotificationRead(n.id)}>
                                        {!n.is_read && <span className="unread-dot"></span>}
                                        <p>{n.message}</p>
                                        <small className="text-muted">{new Date(n.created_at).toLocaleDateString()}</small>
                                    </div>
                                ))}
                                {notifications.length === 0 && <p className="text-muted">No new notifications.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpDesk;
