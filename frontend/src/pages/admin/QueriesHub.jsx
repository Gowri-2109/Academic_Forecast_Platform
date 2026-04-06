import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminLists.css';

const QueriesHub = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    const fetchQueries = async () => {
        try {
            const res = await api.get('/queries');
            setQueries(res.data);
            setLoading(false);
        } catch (e) {
            toast.error('Failed to load queries');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const handleReplySubmit = async (e, id) => {
        e.preventDefault();
        try {
            await api.put(`/queries/${id}`, {
                status: 'Completed',
                admin_reply: replyText
            });
            toast.success('Query resolved and user notified!');
            setReplyingTo(null);
            setReplyText('');
            fetchQueries();
        } catch (err) {
            toast.error('Failed to submit reply');
        }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '50px', color: 'var(--text-muted)'}}>Connecting to support hub...</div>;

    return (
        <div className="admin-list-page fade-in">
            <div className="page-header">
                <h2>Feedback & Queries Hub</h2>
            </div>

            <div className="stats-cards" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#673AB7', backgroundColor: 'rgba(103, 58, 183, 0.1)' }}>💬</div>
                    <div className="stat-info">
                        <h3>Total Queries</h3>
                        <h2>{queries.length}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>⏳</div>
                    <div className="stat-info">
                        <h3>Pending</h3>
                        <h2>{queries.filter(q => q.status !== 'Completed').length}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>✅</div>
                    <div className="stat-info">
                        <h3>Completed</h3>
                        <h2>{queries.filter(q => q.status === 'Completed').length}</h2>
                    </div>
                </div>
            </div>

            <div className="type-toggle" style={{marginBottom: '20px'}}>
                <button 
                    className={activeTab === 'pending' ? 'active' : ''} 
                    onClick={() => setActiveTab('pending')}
                    type="button"
                >Pending Tasks</button>
                <button 
                    className={activeTab === 'completed' ? 'active' : ''} 
                    onClick={() => setActiveTab('completed')}
                    type="button"
                >Completed Tasks</button>
            </div>

            <div className="queries-grid">
                    {queries.filter(q => activeTab === 'pending' ? q.status !== 'Completed' : q.status === 'Completed').map(q => (
                        <div key={q.id} className={`query-card ${q.status === 'Completed' ? 'resolved' : 'pending'} ${String(q.role).toLowerCase()}`}>
                            <div className="query-header">
                                <div>
                                    <strong>{q.user_name}</strong> <span className="badge info">{q.role}</span>
                                </div>
                                <span className={`status-badge ${q.status.toLowerCase()}`}>{q.status}</span>
                            </div>
                            <div className="query-body">
                                <p className="query-msg">"{q.message}"</p>
                                <small className="query-date">{new Date(q.created_at).toLocaleString()}</small>
                            </div>
                            
                            {q.status === 'Completed' ? (
                                <div className="query-reply">
                                    <strong>Admin Reply:</strong>
                                    <p>{q.admin_reply}</p>
                                </div>
                            ) : (
                                <div className="query-actions">
                                    {replyingTo === q.id ? (
                                        <form onSubmit={(e) => handleReplySubmit(e, q.id)} className="reply-form">
                                            <textarea 
                                                value={replyText} 
                                                onChange={e => setReplyText(e.target.value)} 
                                                placeholder="Type your reply here to resolve..."
                                                required
                                                rows="3"
                                            />
                                            <div className="reply-buttons">
                                                <button type="button" className="btn btn-secondary" onClick={() => setReplyingTo(null)}>Cancel</button>
                                                <button type="submit" className="btn btn-primary">Send & Resolve</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button className="btn btn-primary sm" onClick={() => setReplyingTo(q.id)}>Reply & Mark Completed</button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {queries.filter(q => activeTab === 'pending' ? q.status !== 'Completed' : q.status === 'Completed').length === 0 && <p className="no-data">No queries found for this tab.</p>}
                </div>
            
        </div>
    );
};

export default QueriesHub;
