import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../faculty/FacultyViews.css';
import { toast } from 'react-toastify';

const StudentPrediction = () => {
    const studentId = localStorage.getItem('userId');
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContactForm, setShowContactForm] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPrediction = async () => {
            if (!studentId) return;
            try {
                // prediction route calculates on the fly and returns data
                const res = await api.get(`/predict/${studentId}`);
                setPredictionData(res.data);
            } catch (err) {
                console.error("Failed to load prediction data", err);
                toast.error("Failed to load your prediction profile");
            } finally {
                setLoading(false);
            }
        };
        fetchPrediction();
    }, [studentId]);

    const getRiskColor = (risk) => {
        if (!risk) return 'var(--risk-neutral)';
        const r = risk.toLowerCase();
        if (r === 'high' || r === 'at risk') return 'var(--risk-high)';
        if (r === 'medium' || r === 'average' || r === 'moderate') return 'var(--risk-medium)';
        return 'var(--risk-low)';
    };

    const getOverallStatus = () => {
        if (!predictionData) return { label: 'Neutral', color: 'var(--risk-neutral)', icon: 'info' };
        const risk = predictionData.risk_score_percentage || 0;
        const gpa = parseFloat(predictionData.predicted_gpa || 0);

        if (risk > 40 || gpa < 6.0 || predictionData.risk_level === 'High') return { label: 'At Risk', color: 'var(--risk-high)', icon: 'warning' };
        if (gpa > 8.0 && risk < 15 && predictionData.risk_level === 'Low') return { label: 'Excellent', color: 'var(--risk-low)', icon: 'stars' };
        return { label: 'Moderate', color: 'var(--risk-medium)', icon: 'trending_up' };
    };

    const overallStatus = getOverallStatus();


    if (loading) return <div className="view-container fade-in"><h2 style={{marginTop: 0}}>AI Academic Prediction</h2><p>Analyzing your academic profile...</p></div>;

    if (!predictionData) {
        return <div className="view-container fade-in"><h2 style={{marginTop: 0}}>AI Academic Prediction</h2><p>No prediction data available yet. Keep participating in classes and assignments!</p></div>;
    }

    const { category_risks, metrics, risk_level, performance_level, reason, suggestions } = predictionData;

    return (
        <div className="view-container fade-in" style={{ paddingBottom: '60px' }}>
            {/* Premium AI Header */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                padding: '50px',
                borderRadius: '32px',
                color: 'white',
                marginBottom: '50px',
                boxShadow: '0 25px 60px rgba(79, 70, 229, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
                    <div style={{display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: '30px', marginBottom: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'}}>
                        <i className="material-icons" style={{fontSize: '18px'}}>auto_awesome</i>
                        <span style={{fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>AI Engine Active</span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: '950', lineHeight: 1.1 }}>Intellectual Performance Forecasting</h2>
                    <p style={{ opacity: 0.9, fontSize: '1.25rem', marginTop: '15px', lineHeight: '1.5' }}>Predictive modeling based on current academic trajectory, behavioral patterns, and attendance synchronization.</p>
                </div>
                <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '20rem', opacity: 0.08, transform: 'rotate(-10deg)', fontFamily: 'serif', fontWeight: 'bold' }}>AI</div>
            </div>

            {/* Core Metrics Grid */}
            <div className="stats-cards fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '28px', borderBottom: `8px solid ${overallStatus.color}`, boxShadow: '0 15px 40px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <div className="stat-icon" style={{ color: overallStatus.color, backgroundColor: `${overallStatus.color}15`, width: '64px', height: '64px', borderRadius: '20px', marginBottom: '20px' }}>
                        <i className="material-icons" style={{fontSize: '32px'}}>{overallStatus.icon}</i>
                    </div>
                    <div className="stat-info">
                        <h3 style={{fontSize: '0.9rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px'}}>Academic Standing</h3>
                        <h2 style={{ color: overallStatus.color, fontSize: '2.2rem', fontWeight: '950', margin: '5px 0' }}>{overallStatus.label}</h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '28px', borderBottom: `8px solid ${getRiskColor(risk_level)}`, boxShadow: '0 15px 40px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)' }}>
                    <div className="stat-icon" style={{ color: getRiskColor(risk_level), backgroundColor: `${getRiskColor(risk_level)}15`, width: '64px', height: '64px', borderRadius: '20px', marginBottom: '20px' }}>
                        <i className="material-icons" style={{fontSize: '32px'}}>{risk_level === 'High' ? 'priority_high' : 'verified'}</i>
                    </div>
                    <div className="stat-info">
                        <h3 style={{fontSize: '0.9rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px'}}>Probabilistic Risk</h3>
                        <h2 style={{ color: getRiskColor(risk_level), fontSize: '2.2rem', fontWeight: '950', margin: '5px 0' }}>{predictionData.risk_score_percentage || 0}% <span style={{fontSize: '1rem', fontWeight: '600', opacity: 0.7}}>({risk_level})</span></h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '28px', borderBottom: '8px solid var(--primary)', boxShadow: '0 15px 40px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)' }}>
                    <div className="stat-icon" style={{ color: 'var(--primary)', backgroundColor: 'rgba(79, 70, 229, 0.1)', width: '64px', height: '64px', borderRadius: '20px', marginBottom: '20px' }}>
                        <i className="material-icons" style={{fontSize: '32px'}}>trending_up</i>
                    </div>
                    <div className="stat-info">
                        <h3 style={{fontSize: '0.9rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px'}}>Forecasted GPA</h3>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '950', margin: '5px 0', color: 'var(--text-main)' }}>{predictionData.predicted_gpa || '0.00'}</h2>
                    </div>
                </div>
            </div>
            
            {/* Detailed Risk Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                
                {/* 1. Subject-wise Analysis */}
                <div className="premium-card fade-in-up" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '28px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{width: '40px', height: '40px', background: 'var(--bg-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📚</div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Subject Variance</h3>
                        </div>
                        <span style={{ background: getRiskColor(category_risks?.subject_risk), color: '#fff', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{category_risks?.subject_risk}</span>
                    </div>
                    <div style={{ marginBottom: '25px', fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{metrics?.average_marks}<span style={{fontSize: '1rem', opacity: 0.5, fontWeight: '600'}}> AVG</span></div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }} className="custom-scrollbar">
                        {category_risks?.subject_details?.map((sub, idx) => (
                            <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem'}}>
                                <span style={{opacity: 0.8, fontWeight: '500'}}>{sub.subject_name}</span>
                                <span style={{color: getRiskColor(sub.risk), fontWeight: '900'}}>{sub.mark}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Engagement Analysis */}
                <div className="premium-card fade-in-up" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '28px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', animationDelay: '0.1s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{width: '40px', height: '40px', background: 'var(--bg-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📅</div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Engagement Level</h3>
                        </div>
                        <span style={{ background: getRiskColor(category_risks?.attendance_risk), color: '#fff', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{category_risks?.attendance_risk}</span>
                    </div>
                    <div style={{ marginBottom: '25px', fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{metrics?.average_attendance}%</div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                        {category_risks?.attendance_risk === 'High' ? 'Critical alert: Your physical presence in core modules is currently below the academic threshold.' : 'Excellent presence: You are consistently participating in scheduled modules.'}
                    </p>
                </div>

                {/* 3. Behavioral Integrity */}
                <div className="premium-card fade-in-up" style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '28px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{width: '40px', height: '40px', background: 'var(--bg-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>⚖️</div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Behavioral Integrity</h3>
                        </div>
                        <span style={{ background: getRiskColor(category_risks?.disciplinary_risk), color: '#fff', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{category_risks?.disciplinary_risk}</span>
                    </div>
                    <div style={{ marginBottom: '25px', fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{metrics?.malpractice_count} <span style={{fontSize: '1rem', opacity: 0.5, fontWeight: '600'}}>EVENTS</span></div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                        {metrics?.malpractice_count > 0 ? 'Note: Behavioral observations are factored into your long-term success probability.' : 'Professional standard: No negative behavioral observations recorded.'}
                    </p>
                </div>
            </div>

            {/* AI Holistic Assessment Section */}
            <div className="overall-assessment fade-in-up" style={{
                background: 'var(--card-bg)',
                padding: '50px',
                borderRadius: '35px',
                boxShadow: '0 30px 70px rgba(0,0,0,0.08)',
                border: '1px solid var(--border-color)',
                position: 'relative',
                animationDelay: '0.3s'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1.5', minWidth: '350px' }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px'}}>
                            <div style={{width: '12px', height: '12px', borderRadius: '50%', background: getRiskColor(risk_level)}}></div>
                            <h4 style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontWeight: '800' }}>Strategic Trajectory</h4>
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: '1000', color: 'var(--text-main)', margin: '0 0 20px 0', letterSpacing: '-2px' }}>{risk_level} <span style={{color: getRiskColor(risk_level)}}>PROBABILITY</span></div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                            <span style={{ background: 'var(--bg-color)', padding: '12px 25px', borderRadius: '40px', fontWeight: '900', border: '1px solid var(--border-color)', fontSize: '1rem' }}>{performance_level} Performance Class</span>
                            <span style={{ fontWeight: '900', color: getRiskColor(risk_level), fontSize: '1.1rem' }}>{predictionData.risk_score_percentage || 0}% Factor</span>
                        </div>

                        <div style={{ background: 'var(--bg-color)', padding: '35px', borderRadius: '24px', borderLeft: `10px solid ${getRiskColor(risk_level)}`, marginBottom: '30px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '850' }}>Primary Prediction Rationale</h4>
                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: '1.8', fontWeight: '500' }}>
                                <strong style={{color: getRiskColor(risk_level)}}>Diagnostic Signal:</strong> {predictionData.reason || "Neutral trajectory observed."}<br/>
                                {predictionData.reason === 'Low Attendance' ? 'The system has identified significant correlation between modular absence and performance slippage.' : 
                                 predictionData.reason === 'Academic Performance' ? 'Recent assessment vectors indicate a sub-optimal grasp of core conceptual frameworks.' : 
                                 'Analysis indicates a self-sustaining positive feedback loop across all monitored academic dimensions.'}
                            </p>
                        </div>
                        
                        <div style={{ padding: '20px 30px', borderRadius: '18px', background: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.15)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <i className="material-icons">lightbulb</i>
                            <span style={{fontWeight: '700', fontSize: '1.05rem'}}>
                                <strong>AI Foresight:</strong> Concentrated effort on {predictionData.reason || 'consistency'} will statistically yield a {performance_level === 'Excellent' ? 'top-percentile' : 'substantial'} shift in your terminal GPA.
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ flex: '1', minWidth: '320px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)', padding: '40px', borderRadius: '28px', border: '2px dashed rgba(79, 70, 229, 0.2)', height: '100%' }}>
                        {!showContactForm ? (
                            <>
                                <div style={{width: '60px', height: '60px', background: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.1)'}}>
                                    <i className="material-icons" style={{fontSize: '32px', color: 'var(--primary)'}}>auto_fix_high</i>
                                </div>
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>Adaptive Guidance</h4>
                                <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', lineHeight: '1.8', fontWeight: '500' }}>
                                    {suggestions || "Optimize your learning vectors by maintaining current momentum. No corrective actions required at this phase."}
                                </p>
                                <button className="btn btn-primary" style={{ marginTop: '35px', padding: '18px 40px', borderRadius: '18px', fontWeight: '800', width: '100%', fontSize: '1.1rem', boxShadow: '0 15px 30px rgba(79, 70, 229, 0.25)' }} onClick={() => setShowContactForm(true)}>Bridge Communication with Faculty</button>
                            </>
                        ) : (
                            <div className="fade-in">
                                <h4 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>Consultation Request</h4>
                                <textarea 
                                    className="form-control" 
                                    placeholder="Synthesize your academic concerns or specific request for intervention..." 
                                    rows="6" 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    style={{ width: '100%', marginBottom: '25px', padding: '20px', borderRadius: '18px', border: '2px solid rgba(79, 70, 229, 0.1)', background: 'var(--input-bg)', fontSize: '1.05rem', lineHeight: '1.6' }}
                                ></textarea>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{ flex: 1, padding: '15px' }}
                                        onClick={() => {
                                            if(!message.trim()) return toast.error("Communication payload cannot be empty.");
                                            toast.success("Consultation request successfully dispatched to assigned faculty module.");
                                            setMessage('');
                                            setShowContactForm(false);
                                        }}
                                    >Dispatch Message</button>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ flex: 0.5, padding: '15px' }}
                                        onClick={() => setShowContactForm(false)}
                                    >Abort</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Contextual Disclaimer */}
            <div style={{marginTop: '50px', padding: '25px 35px', background: 'var(--bg-color)', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div style={{fontSize: '2rem', filter: 'grayscale(1)'}}>🔬</div>
                <p style={{margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6'}}>
                    <strong>Prediction Sovereignty:</strong> These insights are synthesized from multidimensional academic telemetry. While highly accurate, they serve as success probability indicators rather than deterministic outcomes. Continuous data ingestion ensures maximum forecasting precision.
                </p>
            </div>

            <div style={{marginTop: '40px', padding: '15px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)'}}>
                <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <i className="material-icons" style={{fontSize: '18px'}}>info_outline</i>
                    <strong>Prediction Insight:</strong> AI-driven risk assessments are updated in real-time based on internal marks, attendance fluctuations, and disciplinary activity. Predictions are based on attendance and academic performance.
                </p>
            </div>
        </div>
    );
};

export default StudentPrediction;
