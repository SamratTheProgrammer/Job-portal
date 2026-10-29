import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './JobCard.css';

const JobCard = ({ job, onBookmarkToggle }) => {
  const navigate = useNavigate();
  const { user, toggleBookmark } = useAuth();
  const { toast } = useToast();
  const jobId = job.id || job._id;

  const isInitiallySaved =
    job.isSaved ||
    (user?.savedJobs &&
      user.savedJobs.some((id) => (typeof id === 'string' ? id : id._id || id.id) === jobId));

  const [saved, setSaved] = useState(isInitiallySaved);
  const [saving, setSaving] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning('Please log in to save jobs to your bookmarks.', 'Authentication Required');
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      const res = await toggleBookmark(jobId);
      setSaved(res.isSaved);
      if (res.isSaved) {
        toast.success(`"${job.title}" saved to your bookmarks!`, 'Job Saved');
      } else {
        toast.info(`"${job.title}" removed from saved jobs.`, 'Bookmark Removed');
      }
      if (onBookmarkToggle) {
        onBookmarkToggle(jobId, res.isSaved);
      }
    } catch (err) {
      toast.error(err.message || 'Could not update bookmark', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="job-card glass-panel animate-fade-in">
      <div className="job-card-header">
        <div className="company-info">
          <img
            src={
              job.logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company || 'Job')}&background=0D8ABC&color=fff&rounded=true`
            }
            alt={job.company}
            className="company-logo"
          />
          <div>
            <h3 className="job-title">
              <Link to={`/jobs/${jobId}`}>{job.title}</Link>
            </h3>
            <p className="company-name">{job.company}</p>
          </div>
        </div>
        <button
          className={`save-btn ${saved ? 'active' : ''}`}
          aria-label={saved ? 'Unsave Job' : 'Save Job'}
          onClick={handleBookmark}
          disabled={saving}
          title={saved ? 'Remove from saved' : 'Save job'}
        >
          <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="job-details-meta">
        <span className="meta-item">
          <MapPin size={16} /> {job.location}
        </span>
        <span className="meta-item">
          <DollarSign size={16} /> {job.salary}
        </span>
        <span className="meta-item">
          <Clock size={16} /> {job.type}
        </span>
      </div>

      <div className="job-tags">
        {(job.tags || []).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="job-card-footer">
        <span className="posted-time">{job.posted || 'Recently'}</span>
        <Link to={`/jobs/${jobId}`} className="btn btn-primary btn-sm">
          View & Apply
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
