import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If redirected from another page, take them back there after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user?.name || 'Alex'}!`, 'Logged In');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'candidate') {
      setEmail('alex@hirenova.com');
      setPassword('password123');
      toast.info('Filled credentials for Candidate (Alex)', 'Demo Auto-fill');
    } else {
      setEmail('employer@hirenova.com');
      setPassword('password123');
      toast.info('Filled credentials for Employer (TechFlow)', 'Demo Auto-fill');
    }
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <Briefcase className="logo-icon" />
            <span className="logo-text">Hire<span className="gradient-text">Nova</span></span>
          </Link>
          <h2>Welcome back</h2>
          <p className="text-muted">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="auth-alert error animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <span className="text-muted text-sm">Demo: password123</span>
            </div>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full mt-md" disabled={loading}>
            {loading ? <><Loader2 className="animate-spin mr-sm" size={18} /> Logging in...</> : 'Log in'}
          </button>
        </form>

        <div className="demo-accounts-box">
          <p className="demo-title">Quick Demo Login:</p>
          <div className="demo-buttons">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('candidate')}>
              Candidate (Alex)
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('employer')}>
              Employer (TechFlow)
            </button>
          </div>
        </div>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
