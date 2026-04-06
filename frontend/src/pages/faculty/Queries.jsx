import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './FacultyViews.css';
import { toast } from 'react-toastify';

const Queries = () => {
    const userId = localStorage.getItem('userId');
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (userId) fetchQueries();
    }, [userId]);

    const fetchQueries = async () => {
        try {
            const res = await api.get(`/queries/user/${userId}`);
            setQueries(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load your queries");
        } finally {
            setLoading(false);
        }
    };

    const handleSumbitQuery = async (e) => {
        e.preventDefault();
        if(!newMessage.trim()) return;
        
        setIsSubmitting(true);
        try {
            await api.post('/queries', { user_id: userId, message: newMessage });
            toast.success("Query sent to Admin successfully");
            setNewMessage('');
            fetchQueries(); // Refresh list
        } catch (err) {
            toast.error("Failed to submit query");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="view-container">
            <h2 style={{marginTop: 0}}>Admin Queries & Feedback</h2>
            
            <div className="form-card" style={{background: 'var(--card-bg)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px'}}>
                <form onSubmit={handleSumbitQuery}>
                    <label style={{display: 'block', marginBottom: '10px', fontWeight: '500', fontSize: '1.1rem'}}>
                        Raise a New Query or Request
                    </label>
                    <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px'}}>
                        Need a password reset for a student? Found a bug? Leave a detailed message below for the Admin.
                    </p>
                    <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your query here..."
                        rows="4"
                        required
                        style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical', marginBottom: '15px'}}
                    ></textarea>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Submit to Admin'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="table-wrapper" style={{background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden'}}>
                <h3 style={{padding: '20px', margin: 0, borderBottom: '1px solid var(--border-color)'}}>Your Previous Queries</h3>
                <div style={{padding: '0 20px'}}>
                    {loading ? (
                        <p style={{textAlign: 'center', padding: '20px'}}>Loading...</p>
                    ) : queries.length > 0 ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px 0'}}>
                            {queries.map(q => (
                                <div key={q.id} style={{
                                    padding: '15px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-color)',
                                    borderLeft: `4px solid ${q.status === 'Resolved' ? '#4CAF50' : '#FF9800'}`,
                                    background: q.status === 'Resolved' ? '#f1f8e9' : '#fff8e1'
                                }}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                        <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{new Date(q.created_at).toLocaleString()}</span>
                                        <span className={`badge ${q.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                                            {q.status}
                                        </span>
                                    </div>
                                    <p style={{margin: '0 0 10px 0', color: 'var(--text-main)'}}><strong>You:</strong> {q.message}</p>
                                    
                                    {q.admin_reply && (
                                        <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc'}}>
                                            <p style={{margin: '0', color: '#1565C0'}}><strong>Admin Reply:</strong> {q.admin_reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{padding: '20px', textAlign: 'center', color: 'var(--text-muted)'}}>You haven't raised any queries yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Queries;
