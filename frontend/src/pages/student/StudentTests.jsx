import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../faculty/FacultyViews.css';
import { toast } from 'react-toastify';

const StudentTests = () => {
    const studentUserId = localStorage.getItem('userId');
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending');

    useEffect(() => {
        if (studentUserId) fetchTests();
    }, [studentUserId]);

    const fetchTests = async () => {
        try {
            const res = await api.get(`/tests/student/${studentUserId}`);
            setTests(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load your tests");
        } finally {
            setLoading(false);
        }
    };

    const pendingTests = tests.filter(t => t.status !== 'Completed');
    const completedTests = tests.filter(t => t.status === 'Completed');

    const displayTests = activeTab === 'Pending' ? pendingTests : completedTests;

    return (
        <div className="view-container fade-in">
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, #4facfe 100%)',
                padding: '30px',
                borderRadius: '20px',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div>
                    <h2 style={{margin: 0, fontSize: '1.8rem', fontWeight: '800'}}>My Assessments</h2>
                    <p style={{margin: '5px 0 0 0', opacity: 0.9}}>Track your upcoming tests and review your performance</p>
                </div>
                <div style={{background: 'rgba(255,255,255,0.2)', padding: '15px 25px', borderRadius: '15px', backdropFilter: 'blur(10px)'}}>
                    <span style={{fontSize: '0.9rem', display: 'block', opacity: 0.8}}>Completion Rate</span>
                    <strong style={{fontSize: '1.4rem'}}>{tests.length > 0 ? ((completedTests.length / tests.length) * 100).toFixed(0) : 0}%</strong>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '30px', 
                background: 'var(--card-bg)', 
                padding: '8px', 
                borderRadius: '15px',
                width: 'fit-content',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                border: '1px solid var(--border-color)'
            }}>
                <button 
                    onClick={() => setActiveTab('Pending')}
                    style={{
                        padding: '12px 25px',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'Pending' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'Pending' ? 'white' : 'var(--text-muted)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '18px'}}>schedule</i>
                    Pending ({pendingTests.length})
                </button>
                <button 
                    onClick={() => setActiveTab('Completed')}
                    style={{
                        padding: '12px 25px',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'Completed' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'Completed' ? 'white' : 'var(--text-muted)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="material-icons" style={{fontSize: '18px'}}>check_circle</i>
                    Completed ({completedTests.length})
                </button>
            </div>

            <div className="tests-list">
                {loading ? (
                    <div style={{textAlign: 'center', padding: '100px'}}>
                        <div className="spinner" style={{marginBottom: '20px'}}></div>
                        <p style={{color: 'var(--text-muted)'}}>Fetching your assessments...</p>
                    </div>
                ) : displayTests.length > 0 ? (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px'}}>
                        {displayTests.map(t => (
                            <div key={t.id} className="card hover-scale" style={{
                                background: 'var(--card-bg)',
                                padding: '0',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{
                                    height: '8px', 
                                    background: t.status === 'Completed' 
                                        ? 'linear-gradient(90deg, #00b09b, #96c93d)' 
                                        : 'linear-gradient(90deg, #f83600, #f9d423)'
                                }}></div>
                                
                                <div style={{padding: '25px'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
                                        <div>
                                            <h3 style={{margin: 0, fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)'}}>{t.title}</h3>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                                                <i className="material-icons" style={{fontSize: '16px'}}>subject</i>
                                                {t.subject_name || 'General'}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '6px 15px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            background: t.status === 'Completed' ? 'rgba(0,176,155,0.1)' : 'rgba(248,54,0,0.1)',
                                            color: t.status === 'Completed' ? '#00b09b' : '#f83600',
                                            border: `1px solid ${t.status === 'Completed' ? 'rgba(0,176,155,0.2)' : 'rgba(248,54,0,0.2)'}`
                                        }}>
                                            {t.status}
                                        </span>
                                    </div>
                                    
                                    <p style={{color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.6'}}>
                                        {t.description || 'Prepare thoroughly for this assessment to maintain your academic performance.'}
                                    </p>

                                    <div style={{
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gap: '20px', 
                                        padding: '20px', 
                                        background: 'var(--bg-color)', 
                                        borderRadius: '15px'
                                    }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div style={{background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                                <i className="material-icons" style={{color: 'var(--primary)', fontSize: '20px'}}>calendar_today</i>
                                            </div>
                                            <div>
                                                <small style={{display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase'}}>Date</small>
                                                <strong style={{fontSize: '0.95rem'}}>{new Date(t.test_date).toLocaleDateString()}</strong>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div style={{background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                                <i className="material-icons" style={{color: '#9c27b0', fontSize: '20px'}}>timer</i>
                                            </div>
                                            <div>
                                                <small style={{display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase'}}>Duration</small>
                                                <strong style={{fontSize: '0.95rem'}}>{t.duration_mins} mins</strong>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div style={{background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                                                <i className="material-icons" style={{color: '#ff9800', fontSize: '20px'}}>assessment</i>
                                            </div>
                                            <div>
                                                <small style={{display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase'}}>Total</small>
                                                <strong style={{fontSize: '0.95rem'}}>{t.total_marks} Marks</strong>
                                            </div>
                                        </div>
                                        {t.marks_obtained !== null && (
                                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                <div style={{background: 'rgba(0,176,155,0.1)', padding: '8px', borderRadius: '10px'}}>
                                                    <i className="material-icons" style={{color: '#00b09b', fontSize: '20px'}}>emoji_events</i>
                                                </div>
                                                <div>
                                                    <small style={{display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase'}}>Scored</small>
                                                    <strong style={{color: '#00b09b', fontSize: '1.2rem'}}>{t.marks_obtained}</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card fade-in" style={{
                        padding: '100px 50px', 
                        textAlign: 'center', 
                        background: 'var(--card-bg)',
                        borderRadius: '30px',
                        border: '2px dashed var(--border-color)',
                        boxShadow: 'none'
                    }}>
                        <div style={{
                            width: '100px', 
                            height: '100px', 
                            background: 'var(--bg-color)', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 25px'
                        }}>
                            <i className="material-icons" style={{fontSize: '3rem', color: 'var(--text-muted)'}}>assignment_turned_in</i>
                        </div>
                        <h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>No {activeTab.toLowerCase()} tests</h3>
                        <p style={{color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto'}}>
                            You're all caught up! There are no {activeTab.toLowerCase()} assessments to display at the moment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTests;
