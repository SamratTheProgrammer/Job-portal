import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Bookmark, 
  Settings, 
  Bell, 
  ChevronRight, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Lock
} from 'lucide-react';
import JobCard from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersAPI, applicationsAPI, jobsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('applied');
  const [stats, setStats] = useState({
    appliedCount: 0,
    savedCount: 0,
    interviewCount: 0,
    alertsCount: 0,
  });

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    bio: '',
    phone: '',
    location: '',
    resumeUrl: '',
    skills: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    jobRecommendations: true,
    applicationUpdates: true,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });

  // Post Job State (for employers/recruiters)
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full Time',
    experience: 'Mid Level',
    category: 'Engineering',
    description: '',
    requirements: '',
    tags: '',
  });
  const [jobPosting, setJobPosting] = useState(false);
  const [jobMessage, setJobMessage] = useState({ type: '', text: '' });

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, savedRes] = await Promise.all([
        usersAPI.getDashboardStats().catch(() => ({ stats: {} })),
        applicationsAPI.getMyApplications().catch(() => ({ applications: [] })),
        usersAPI.getSavedJobs().catch(() => ({ savedJobs: [] })),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (appsRes.applications) setAppliedJobs(appsRes.applications);
      if (savedRes.savedJobs) setSavedJobs(savedRes.savedJobs);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load initial user profile fields
    if (user) {
      setProfileData({
        name: user.name || '',
        title: user.title || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        resumeUrl: user.resumeUrl || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      });

      if (user.notificationPreferences) {
        setNotifications(user.notificationPreferences);
      }

      if (user.role === 'employer') {
        setJobForm((prev) => ({
          ...prev,
          company: user.companyName || user.name || '',
        }));
      }
    }

    loadDashboardData();
  }, [isAuthenticated, user, loadDashboardData]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await usersAPI.updateProfile({
        name: profileData.name,
        title: profileData.title,
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        resumeUrl: profileData.resumeUrl,
        skills: profileData.skills,
      });

      if (res.success) {
        updateUser(res.user);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        toast.success('Your profile changes have been saved!', 'Profile Saved');
      }
    } catch (err) {
      const msg = err.message || 'Failed to update profile';
      setProfileMessage({ type: 'error', text: msg });
      toast.error(msg, 'Update Failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSettingsMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match';
      setSettingsMessage({ type: 'error', text: msg });
      toast.error(msg, 'Validation Error');
      return;
    }

    if (newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters';
      setSettingsMessage({ type: 'error', text: msg });
      toast.error(msg, 'Validation Error');
      return;
    }

    setSettingsSaving(true);
    try {
      const res = await usersAPI.updateSettings({
        currentPassword,
        newPassword,
        notificationPreferences: notifications,
      });

      if (res.success) {
        const msg = 'Password and settings updated successfully!';
        setSettingsMessage({ type: 'success', text: msg });
        toast.success(msg, 'Settings Saved');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const msg = err.message || 'Failed to update settings';
      setSettingsMessage({ type: 'error', text: msg });
      toast.error(msg, 'Settings Error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await usersAPI.updateSettings({ notificationPreferences: updated });
      toast.info('Notification preferences updated.', 'Settings');
    } catch (err) {
      toast.error('Failed to update notification setting', 'Error');
      console.error('Failed to update notification setting:', err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setJobPosting(true);
    setJobMessage({ type: '', text: '' });

    try {
      const reqList = jobForm.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await jobsAPI.create({
        ...jobForm,
        requirements: reqList,
      });

      if (res.success) {
        const msg = `Job "${jobForm.title}" published successfully!`;
        setJobMessage({ type: 'success', text: msg });
        toast.success(msg, 'Job Live');
        setJobForm({
          title: '',
          company: user?.companyName || user?.name || '',
          location: '',
          salary: '',
          type: 'Full Time',
          experience: 'Mid Level',
          category: 'Engineering',
          description: '',
          requirements: '',
          tags: '',
        });
        loadDashboardData();
      }
    } catch (err) {
      const msg = err.message || 'Failed to post job';
      setJobMessage({ type: 'error', text: msg });
      toast.error(msg, 'Posting Error');
    } finally {
      setJobPosting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-2xl text-center glass-panel mt-xl animate-fade-in">
        <Lock size={48} className="text-primary mx-auto mb-md" />
        <h2>Authentication Required</h2>
        <p className="text-muted mb-lg">Please log in to your account to view your dashboard, applications, and settings.</p>
        <Link to="/login" className="btn btn-primary">Log in to HireNova</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-page container animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome back, <span className="gradient-text">{user?.name || 'Alex'}!</span></h1>
        <p className="text-muted">
          {user?.role === 'employer' 
            ? 'Manage your posted positions, candidate applications, and company profile.' 
            : 'Track your active job applications, saved opportunities, and career profile.'}
        </p>
      </div>

      <div className="dashboard-stats grid-4">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><FileText size={24} className="text-primary" /></div>
          <div>
            <h3>{stats.appliedCount ?? 0}</h3>
            <p>Applied Jobs</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><Bookmark size={24} className="text-primary" /></div>
          <div>
            <h3>{stats.savedCount ?? 0}</h3>
            <p>Saved Jobs</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><User size={24} className="text-primary" /></div>
          <div>
            <h3>{stats.interviewCount ?? 0}</h3>
            <p>Interviews</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper"><Bell size={24} className="text-primary" /></div>
          <div>
            <h3>{stats.alertsCount ?? 4}</h3>
            <p>New Alerts</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar glass-panel">
          <nav className="dashboard-nav">
            <button 
              type="button"
              className={`dashboard-nav-item ${activeTab === 'applied' ? 'active' : ''}`}
              onClick={() => setActiveTab('applied')}
            >
              <FileText size={18} /> Applied Jobs <ChevronRight size={16} className="ml-auto" />
            </button>
            <button 
              type="button"
              className={`dashboard-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark size={18} /> Saved Jobs <ChevronRight size={16} className="ml-auto" />
            </button>
            <button 
              type="button"
              className={`dashboard-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> My Profile <ChevronRight size={16} className="ml-auto" />
            </button>
            <button 
              type="button"
              className={`dashboard-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Settings <ChevronRight size={16} className="ml-auto" />
            </button>
            <button 
              type="button"
              className={`dashboard-nav-item ${activeTab === 'post-job' ? 'active' : ''}`}
              onClick={() => setActiveTab('post-job')}
            >
              <PlusCircle size={18} /> Post a Job <ChevronRight size={16} className="ml-auto" />
            </button>
          </nav>
        </aside>

        <main className="dashboard-main">
          {/* TAB 1: APPLIED JOBS */}
          {activeTab === 'applied' && (
            <div className="tab-pane animate-fade-in">
              <h2>Recent Applications ({appliedJobs.length})</h2>
              {loading ? (
                <div className="text-center py-xl">
                  <Loader2 className="animate-spin text-primary mx-auto mb-sm" size={32} />
                  <p className="text-muted">Loading your applications...</p>
                </div>
              ) : appliedJobs.length === 0 ? (
                <div className="empty-state-card glass-panel animate-fade-in">
                  <div className="empty-icon-circle">
                    <FileText size={32} />
                  </div>
                  <h3>No applications yet</h3>
                  <p>Start exploring open opportunities, submit your resume, and track each stage of your application journey right here.</p>
                  <Link to="/jobs" className="btn btn-primary">
                    Browse Open Jobs <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="jobs-list mt-lg">
                  {appliedJobs.map((app) => {
                    const job = app.job;
                    if (!job) return null;
                    const status = app.status || 'Applied';

                    return (
                      <div key={app._id} className="applied-job-item glass-panel">
                        <JobCard job={job} />
                        <div className="application-status">
                          <div className="applied-meta-row">
                            <span className="text-muted text-sm">
                              Applied on {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                            {app.resumeUrl && (
                              <a 
                                href={app.resumeUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="resume-link text-sm"
                              >
                                View Submitted Resume <ExternalLink size={12} className="inline ml-xs" />
                              </a>
                            )}
                          </div>
                          <div className="status-timeline mt-md">
                            <div className={`status-step ${status !== 'Rejected' ? 'active' : ''}`}>
                              Applied
                            </div>
                            <div className="status-line"></div>
                            <div className={`status-step ${['Reviewing', 'Interview', 'Offered'].includes(status) ? 'active' : ''}`}>
                              Reviewing
                            </div>
                            <div className="status-line"></div>
                            <div className={`status-step ${['Interview', 'Offered'].includes(status) ? 'active' : ''}`}>
                              Interview
                            </div>
                            <div className="status-line"></div>
                            <div className={`status-step ${status === 'Offered' ? 'active' : status === 'Rejected' ? 'text-danger' : ''}`}>
                              {status === 'Rejected' ? 'Rejected' : 'Offer'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED JOBS */}
          {activeTab === 'saved' && (
            <div className="tab-pane animate-fade-in">
              <h2>Saved Jobs ({savedJobs.length})</h2>
              {loading ? (
                <div className="text-center py-xl">
                  <Loader2 className="animate-spin text-primary mx-auto mb-sm" size={32} />
                  <p className="text-muted">Loading saved jobs...</p>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="empty-state-card glass-panel animate-fade-in">
                  <div className="empty-icon-circle">
                    <Bookmark size={32} />
                  </div>
                  <h3>No saved jobs</h3>
                  <p>Bookmark jobs as you browse to review them later, compare compensation packages, and apply whenever you are ready.</p>
                  <Link to="/jobs" className="btn btn-primary">
                    Explore Jobs <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="jobs-grid mt-lg">
                  {savedJobs.map((job) => (
                    <JobCard 
                      key={job.id || job._id} 
                      job={job} 
                      onBookmarkToggle={(jobId, isSaved) => {
                        if (!isSaved) {
                          setSavedJobs((prev) => prev.filter((j) => (j.id || j._id) !== jobId));
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="tab-pane animate-fade-in glass-panel profile-pane">
              <h2>My Profile</h2>
              <p className="text-muted mb-lg">Keep your personal and professional profile up to date for recruiters.</p>

              {profileMessage.text && (
                <div className={`auth-alert ${profileMessage.type} mb-lg`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Professional Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Frontend Engineer"
                    value={profileData.title} 
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="+1 (555) 000-0000"
                      value={profileData.phone} 
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. San Francisco, CA"
                      value={profileData.location} 
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Resume / Portfolio Link</label>
                  <input 
                    type="url" 
                    placeholder="https://hirenova.com/my-resume.pdf"
                    value={profileData.resumeUrl} 
                    onChange={(e) => setProfileData({ ...profileData, resumeUrl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Skills (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="React, Node.js, TypeScript, UI/UX"
                    value={profileData.skills} 
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Bio / Summary</label>
                  <textarea 
                    rows="3" 
                    placeholder="Brief description of your expertise and background..."
                    value={profileData.bio} 
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary mt-md" disabled={profileSaving}>
                  {profileSaving ? <><Loader2 className="animate-spin mr-sm" size={18} /> Saving...</> : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="tab-pane animate-fade-in glass-panel settings-pane">
              <h2>Account Settings</h2>
              <p className="text-muted mb-lg">Manage your account security and notification preferences.</p>

              {settingsMessage.text && (
                <div className={`auth-alert ${settingsMessage.type} mb-lg`}>
                  {settingsMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{settingsMessage.text}</span>
                </div>
              )}

              <div className="settings-section mb-2xl">
                <h3 className="mb-md">Notification Preferences</h3>
                <div className="toggle-list">
                  <label className="toggle-item">
                    <div>
                      <strong>Email Alerts</strong>
                      <p className="text-muted text-sm">Receive email updates on new jobs matching your profile</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifications.emailAlerts}
                      onChange={() => handleToggleNotification('emailAlerts')}
                    />
                  </label>
                  <label className="toggle-item">
                    <div>
                      <strong>Job Recommendations</strong>
                      <p className="text-muted text-sm">Weekly curated opportunities based on your skills</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifications.jobRecommendations}
                      onChange={() => handleToggleNotification('jobRecommendations')}
                    />
                  </label>
                  <label className="toggle-item">
                    <div>
                      <strong>Application Status Updates</strong>
                      <p className="text-muted text-sm">Instant notifications when employers review your submission</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notifications.applicationUpdates}
                      onChange={() => handleToggleNotification('applicationUpdates')}
                    />
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="mb-md">Change Password</h3>
                <form className="password-form" onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      placeholder="At least 6 characters" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary mt-md" disabled={settingsSaving || !newPassword}>
                    {settingsSaving ? <><Loader2 className="animate-spin mr-sm" size={18} /> Updating...</> : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: POST A JOB */}
          {activeTab === 'post-job' && (
            <div className="tab-pane animate-fade-in glass-panel profile-pane">
              <h2>Post a New Job</h2>
              <p className="text-muted mb-lg">Publish a new job listing to attract qualified candidates across HireNova.</p>

              {jobMessage.text && (
                <div className={`auth-alert ${jobMessage.type} mb-lg`}>
                  {jobMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{jobMessage.text}</span>
                </div>
              )}

              <form className="post-job-form" onSubmit={handleCreateJob}>
                <div className="form-group">
                  <label>Job Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Lead DevOps Engineer"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Acme Tech"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. New York, NY (Remote)"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. $120k - $150k"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={jobForm.category}
                      onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Product">Product</option>
                      <option value="Sales">Sales</option>
                      <option value="Customer Support">Customer Support</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Type</label>
                    <select 
                      value={jobForm.type}
                      onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Experience Level</label>
                    <select 
                      value={jobForm.experience}
                      onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="React, Node.js, AWS, Kubernetes"
                    value={jobForm.tags}
                    onChange={(e) => setJobForm({ ...jobForm, tags: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea 
                    rows="4" 
                    required 
                    placeholder="Detailed overview of the role, team, and day-to-day impact..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Key Requirements (one per line)</label>
                  <textarea 
                    rows="3" 
                    placeholder="5+ years of software experience&#10;Strong problem solving skills"
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary mt-md" disabled={jobPosting}>
                  {jobPosting ? <><Loader2 className="animate-spin mr-sm" size={18} /> Posting Job...</> : 'Publish Job Listing'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
