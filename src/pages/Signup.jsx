import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const [userType, setUserType] = useState('candidate');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long';
      setError(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await register({
        name: fullName,
        email,
        password,
        role: userType,
        companyName: userType === 'employer' ? companyName : '',
      });
      toast.success('Account created successfully! Welcome to HireNova.', 'Welcome!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Failed to create account';
      setError(msg);
      toast.error(msg, 'Signup Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <Briefcase className="logo-icon" />
            <span className="logo-text">Hire<span className="gradient-text">Nova</span></span>
          </Link>
          <h2>Create an account</h2>
          <p className="text-muted">Start your journey with us today</p>
        </div>

        <div className="account-type-toggle">
          <button 
            type="button"
            className={`type-btn ${userType === 'candidate' ? 'active' : ''}`}
            onClick={() => setUserType('candidate')}
          >
            Candidate
          </button>
          <button 
            type="button"
            className={`type-btn ${userType === 'employer' ? 'active' : ''}`}
            onClick={() => setUserType('employer')}
          >
            Employer
          </button>
        </div>

        {error && (
          <div className="auth-alert error animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                required 
                placeholder="Jane" 
                value={firstName}
                autoComplete="given-name"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                required 
                placeholder="Doe" 
                value={lastName}
                autoComplete="family-name"
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {userType === 'employer' && (
            <div className="form-group">
              <label>Company Name</label>
              <input 
                type="text" 
                required 
                placeholder="Acme Corp" 
                value={companyName}
                autoComplete="organization"
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="jane@example.com" 
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              placeholder="At least 6 characters" 
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full mt-md" disabled={loading}>
            {loading ? <><Loader2 className="animate-spin mr-sm" size={18} /> Creating account...</> : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
