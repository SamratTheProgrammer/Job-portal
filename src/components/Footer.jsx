import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Globe, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo">
              <Briefcase className="logo-icon" />
              <span className="logo-text">Hire<span className="gradient-text">Nova</span></span>
            </Link>
            <p className="footer-description">
              Connecting top talent with the world's most innovative companies. Your next big career move starts here.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><Globe size={20} /></a>
              <a href="#" className="social-link"><Mail size={20} /></a>
              <a href="#" className="social-link"><Phone size={20} /></a>
              <a href="#" className="social-link"><MapPin size={20} /></a>
            </div>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-title">For Candidates</h4>
            <ul className="footer-links">
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/companies">Browse Companies</Link></li>
              <li><Link to="/salary">Salary Calculator</Link></li>
              <li><Link to="/dashboard">Saved Jobs</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-title">For Employers</h4>
            <ul className="footer-links">
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/employer-dashboard">Dashboard</Link></li>
              <li><Link to="/recruiting">Recruiting Solutions</Link></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HireNova. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
