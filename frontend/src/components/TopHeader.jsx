import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import './TopHeader.css'; 

const TopHeader = ({ title }) => {
    const userName = localStorage.getItem('userName') || 'User';
    const userRole = localStorage.getItem('role') || 'Role';
    const userEmail = localStorage.getItem('email') || 'user@example.com';
    const userId = localStorage.getItem('userId');
    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isForgotAuthOpen, setIsForgotAuthOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const unreadCount = notifications.length; // all visible are unread
    
    const headerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setDropdownOpen(false);
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications/${userId}`);
            setNotifications(res.data.filter(n => !n.is_read));
        } catch (err) {
            console.error("Failed to load notifications", err);
        }
    };

    const markAsRead = async (notifId) => {
        try {
            await api.put(`/notifications/${notifId}/read`);
            setNotifications(prev => prev.filter(n => n.id !== notifId));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put(`/notifications/read-all/${userId}`);
            setNotifications([]);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const getNotifIcon = (type) => {
        switch(type) {
            case 'assignment': return 'assignment';
            case 'test': return 'quiz';
            case 'mark': return 'grade';
            case 'attendance': return 'event_available';
            case 'query': return 'question_answer';
            default: return 'info';
        }
    };

    const getNotifColor = (type) => {
        switch(type) {
            case 'assignment': return '#2196F3';
            case 'test': return '#FF9800';
            case 'mark': return '#4CAF50';
            case 'attendance': return '#9C27B0';
            case 'query': return '#E91E63';
            default: return 'var(--primary)';
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Updated endpoint to verify current password if needed, or backend can handle it.
            // For now, we will pass both
            await api.put('/auth/change-password', { userId, currentPassword, newPassword });
            toast.success('Password changed successfully');
            setIsPasswordModalOpen(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Incorrect current password or failed to change');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // We simulate sending a request to Admin queries for password reset
            // This is matched to the specific feature request
            await api.post('/queries', { user_id: userId, message: `Forgot Password Reset Request for Email: ${forgotEmail}` });
            toast.success('Request sent to Admin. You will receive a notification when reset.');
            setIsForgotAuthOpen(false);
            setForgotEmail('');
        } catch (err) {
            toast.error('Failed to send reset request');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <header className="top-header" ref={headerRef}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {String(userRole).toLowerCase() === 'admin' ? (
                    <span className="welcome-badge" style={{
                        background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        Welcome Admin
                    </span>
                ) : String(userRole).toLowerCase() === 'faculty' ? (
                     <span className="welcome-badge" style={{
                        background: 'linear-gradient(135deg, #2196F3, #1565C0)',
                        color: 'white',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                        Welcome Faculty
                    </span>
                ) : null}
                <h2>{title}</h2>
            </div>
            <div className="header-actions" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                
                {/* Notifications Bell */}
                <div className="notifications-wrapper" style={{position: 'relative', cursor: 'pointer'}} onClick={() => {setNotificationsOpen(!notificationsOpen); setDropdownOpen(false);}}>
                    <i className="material-icons" style={{fontSize: '28px', color: '#555', marginTop: '5px'}}>notifications</i>
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    
                    {notificationsOpen && (
                        <div className="notifications-dropdown" style={{
                            position: 'absolute', 
                            top: '50px', 
                            right: '-10px', 
                            width: '350px', 
                            backgroundColor: 'var(--card-bg)', 
                            borderRadius: '12px', 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
                            zIndex: 1000, 
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '15px 20px', 
                                borderBottom: '1px solid var(--border-color)', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                background: 'var(--input-bg)'
                            }}>
                                <h4 style={{margin: 0, fontSize: '1rem', color: 'var(--text-main)'}}>Notifications</h4>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                                        style={{background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold'}}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="notifications-list" style={{maxHeight: '380px', overflowY: 'auto'}}>
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        className="notification-item unread" 
                                        style={{
                                            padding: '15px 20px', 
                                            borderBottom: '1px solid var(--border-color)', 
                                            display: 'flex', 
                                            gap: '12px',
                                            transition: 'background 0.2s',
                                            cursor: 'pointer'
                                        }} 
                                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{
                                            width: '36px', 
                                            height: '36px', 
                                            borderRadius: '50%', 
                                            backgroundColor: `${getNotifColor(n.type)}20`, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <i className="material-icons" style={{fontSize: '20px', color: getNotifColor(n.type)}}>
                                                {getNotifIcon(n.type)}
                                            </i>
                                        </div>
                                        <div style={{flex: 1}}>
                                            <p style={{margin: '0 0 4px 0', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4'}}>
                                                {n.message}
                                            </p>
                                            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block'}}>
                                                {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(n.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
                                        <i className="material-icons" style={{fontSize: '48px', marginBottom: '10px', opacity: 0.3}}>notifications_off</i>
                                        <p style={{margin: 0, fontSize: '0.9rem'}}>No new notifications</p>
                                    </div>
                                )}
                            </div>
                            <div style={{padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border-color)', background: 'var(--input-bg)'}}>
                                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>You have {unreadCount} unread alerts</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div 
                   className="user-profile" 
                   onClick={() => {setDropdownOpen(!dropdownOpen); setNotificationsOpen(false);}}
                   style={{cursor: 'pointer', position: 'relative'}}
                >
                    <div className="avatar">
                        {userName.charAt(0)}
                    </div>
                    <span>{userName}</span>
                    
                    {dropdownOpen && (
                        <div className="profile-dropdown">
                            <div className="dropdown-info">
                                <strong style={{color: 'var(--text-main)'}}>{userName}</strong>
                                <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px'}}>{userEmail}</span>
                            </div>
                            <hr style={{borderColor: 'var(--border-color)'}}/>
                            <button className="dropdown-item" onClick={() => { setIsPasswordModalOpen(true); setDropdownOpen(false); }}>Change Password</button>
                            {String(userRole).toLowerCase() !== 'admin' && (
                                <button className="dropdown-item" onClick={() => { setIsForgotAuthOpen(true); setDropdownOpen(false); }}>Forgot Password?</button>
                            )}
                            <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="modal-overlay" style={{zIndex: 2000}}>
                    <div className="modal-content" style={{maxWidth: '400px', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)'}}>
                        <div className="modal-header">
                            <h3>Change Password</h3>
                            <button className="close-btn" onClick={() => setIsPasswordModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group full">
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Current Password *</label>
                                    <input 
                                        type="password" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        placeholder="Enter current password"
                                        style={{width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '15px', background: 'var(--input-bg)', color: 'var(--text-main)'}}
                                    />
                                    <label style={{ display: 'block', marginBottom: '5px' }}>New Password *</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="Enter new password"
                                        style={{width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)'}}
                                    />
                                </div>
                                <div className="form-actions" style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Forgot Password Flow */}
            {isForgotAuthOpen && (
                <div className="modal-overlay" style={{zIndex: 2000}}>
                    <div className="modal-content" style={{maxWidth: '400px', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)'}}>
                        <div className="modal-header">
                            <h3>Forgot Password</h3>
                            <button className="close-btn" onClick={() => setIsForgotAuthOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleForgotPassword}>
                                <div className="form-group full">
                                    <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#555'}}>Enter your email to request a new password from Admin.</p>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Email Address *</label>
                                    <input 
                                        type="email" 
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                        placeholder="Enter your registered email"
                                        style={{width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)'}}
                                    />
                                </div>
                                <div className="form-actions" style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsForgotAuthOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Sending...' : 'Request Reset'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default TopHeader;
