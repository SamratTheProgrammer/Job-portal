import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  Share2,
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleBookmark } = useAuth();
  const { toast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await jobsAPI.getById(id);
        if (res.success && res.job) {
          setJob(res.job);
          setApplied(res.job.hasApplied || false);
          setIsSaved(res.job.isSaved || false);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setResumeUrl(user.resumeUrl || '');
    }
  }, [user]);

  const handleApplyClick = () => {
    if (!user) {
      toast.warning('Please log in before submitting an application.', 'Authentication Required');
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    setShowApplyModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);

    try {
      const res = await applicationsAPI.apply(id, {
        fullName,
        email,
        resumeUrl,
        coverLetter,
      });

      if (res.success) {
        setApplied(true);
        toast.success(`Application sent to ${job.company}! We wish you the best of luck.`, 'Application Submitted');
        setTimeout(() => {
          setShowApplyModal(false);
        }, 2200);
      }
    } catch (err) {
      const msg = err.message || 'Could not submit application';
      setApplyError(msg);
      toast.error(msg, 'Application Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      toast.warning('Please log in to save this job.', 'Authentication Required');
      navigate('/login');
      return;
    }
    try {
      const res = await toggleBookmark(id);
      setIsSaved(res.isSaved);
      if (res.isSaved) {
        toast.success(`Saved "${job.title}" to your bookmarks!`, 'Job Saved');
      } else {
        toast.info(`Removed "${job.title}" from saved jobs.`, 'Bookmark Removed');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating bookmark', 'Error');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Job link copied to clipboard!', 'Link Copied');
      } else {
        toast.info(window.location.href, 'Job URL');
      }
    } catch {
      toast.info(window.location.href, 'Job URL');
    }
  };

  if (loading) {
    return (
      <div className="container py-2xl text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-md" size={40} />
        <p className="text-muted">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container py-2xl text-center glass-panel mt-xl">
        <AlertCircle size={48} className="text-danger mx-auto mb-md" />
        <h2>{error || 'Job not found'}</h2>
        <p className="text-muted mb-lg">The job listing you are looking for may have been removed or expired.</p>
        <Link to="/jobs" className="btn btn-primary">Browse All Jobs</Link>
      </div>
    );
  }

  return (
    <div className="job-details-page container animate-fade-in">
      <Link to="/jobs" className="back-link mb-md">
        <ArrowLeft size={16} /> Back to all jobs
      </Link>

      <div className="job-details-header glass-panel">
        <div className="header-main">
          <img 
            src={job.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=0D8ABC&color=fff&rounded=true`} 
            alt={job.company} 
            className="details-logo" 
          />
          <div className="header-info">
            <h1 className="details-title">{job.title}</h1>
            <p className="details-company">{job.company}</p>
            <div className="details-meta">
              <span className="meta-badge"><MapPin size={14} /> {job.location}</span>
              <span className="meta-badge"><DollarSign size={14} /> {job.salary}</span>
              <span className="meta-badge"><Clock size={14} /> {job.type}</span>
              <span className="meta-badge"><Calendar size={14} /> Posted {job.posted || 'Recently'}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            type="button"
            className="btn btn-outline icon-btn" 
            onClick={handleShare}
            title="Share job link"
            aria-label="Share Job"
          >
            <Share2 size={18} />
          </button>
          <button 
            type="button"
            className={`btn btn-outline icon-btn ${isSaved ? 'active' : ''}`}
            onClick={handleToggleSave}
            title={isSaved ? 'Remove from saved' : 'Save job'}
            aria-label="Save Job"
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          
          {applied ? (
            <button className="btn btn-outline apply-btn" disabled>
              <CheckCircle2 size={18} className="mr-sm text-primary" /> Application Submitted
            </button>
          ) : (
            <button className="btn btn-primary apply-btn" onClick={handleApplyClick}>
              Apply Now
            </button>
          )}
        </div>
      </div>

      <div className="job-details-content">
        <main className="job-description glass-panel">
          <h2>Job Description</h2>
          <p className="description-text">{job.description}</p>
          
          <h3 className="section-subtitle">Requirements</h3>
          <ul className="requirements-list">
            {(job.requirements && job.requirements.length > 0) ? (
              job.requirements.map((req, index) => (
                <li key={index}>
                  <CheckCircle2 size={18} className="check-icon" /> <span>{req}</span>
                </li>
              ))
            ) : (
              <li><CheckCircle2 size={18} className="check-icon" /> <span>Relevant professional experience in this field.</span></li>
            )}
          </ul>
          
          <h3 className="section-subtitle">Tags & Skills</h3>
          <div className="job-tags">
            {(job.tags || []).map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </main>
        
        <aside className="company-sidebar glass-panel">
          <h3>About {job.company}</h3>
          <div className="company-profile">
            <img 
              src={job.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=0D8ABC&color=fff&rounded=true`} 
              alt={job.company} 
            />
            <p>A fast-growing innovator offering top-tier solutions, strong collaborative culture, and outstanding career growth.</p>
            <div className="company-stats-box mt-md">
              <div className="stat-row">
                <span className="text-muted">Industry:</span>
                <span>{job.category || 'Technology'}</span>
              </div>
              <div className="stat-row">
                <span className="text-muted">Job Type:</span>
                <span>{job.type}</span>
              </div>
              <div className="stat-row">
                <span className="text-muted">Experience:</span>
                <span>{job.experience || 'Mid Level'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showApplyModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel">
            {!applied ? (
              <>
                <h2>Apply for {job.title}</h2>
                <p className="text-muted mb-md">at {job.company}</p>

                {applyError && (
                  <div className="auth-alert error mb-md">
                    <AlertCircle size={18} />
                    <span>{applyError}</span>
                  </div>
                )}

                <form className="apply-form" onSubmit={handleApply}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="John Doe" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="john@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Resume / CV Link (URL)</label>
                    <input 
                      type="url" 
                      required 
                      placeholder="https://drive.google.com/your-resume or LinkedIn" 
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cover Letter / Pitch</label>
                    <textarea 
                      rows="4" 
                      placeholder="Share what makes you a compelling fit for this role..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn btn-ghost" 
                      onClick={() => setShowApplyModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? <><Loader2 className="animate-spin mr-sm" size={18} /> Submitting...</> : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="success-state py-xl text-center">
                <CheckCircle2 size={64} className="success-icon text-primary mx-auto mb-md" />
                <h2>Application Submitted!</h2>
                <p className="text-muted">We have successfully delivered your profile to {job.company}. Good luck!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
