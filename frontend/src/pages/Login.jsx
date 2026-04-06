import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('email', user.email);
      
      // Use window.location.href instead of navigate so that App.jsx 
      // is completely re-mounted and re-reads localStorage
      const roleStr = String(user.role).toLowerCase();
      if (roleStr === 'admin') window.location.href = '/admin';
      else if (roleStr === 'faculty') window.location.href = '/faculty';
      else if (roleStr === 'student') window.location.href = '/student';
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="auth-container bg-animated">
      <div className="auth-card scale-in">
        <h2 className="auth-title">Academic Forecast</h2>
        <p className="auth-subtitle">Welcome back! Please login to your account.</p>
        
        {error && <div className="error-alert">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group slide-up-1">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group slide-up-2">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary slide-up-3">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
