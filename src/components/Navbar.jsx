import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, User, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out successfully.', 'Logged Out');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Jobs', path: '/jobs' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Briefcase className="logo-icon" />
          <span className="logo-text">Hire<span className="gradient-text">Nova</span></span>
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <div className="nav-actions mobile-only">
            <button className="theme-toggle-btn btn btn-ghost" onClick={toggleTheme}>
              {theme === 'light' ? <><Moon size={18} className="mr-sm" /> Dark Mode</> : <><Sun size={18} className="mr-sm" /> Light Mode</>}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                  <User size={16} className="mr-sm" /> {user?.name || 'Dashboard'}
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost text-danger">
                  <LogOut size={16} className="mr-sm" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>

        <div className="nav-actions desktop-only">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated ? (
            <div className="user-nav-badge">
              <Link to="/dashboard" className="user-pill-btn">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`} 
                  alt={user?.name} 
                  className="nav-avatar"
                />
                <span className="user-name-text">{user?.name}</span>
                <span className="role-tag">{user?.role === 'employer' ? 'Employer' : 'Candidate'}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost icon-btn" title="Log out" aria-label="Log out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
