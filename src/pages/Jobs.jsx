import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, Loader2, RefreshCw } from 'lucide-react';
import JobCard from '../components/JobCard';
import { jobsAPI } from '../services/api';
import './Jobs.css';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const [filters, setFilters] = useState({
    type: searchParams.get('type') ? [searchParams.get('type')] : [],
    experience: searchParams.get('experience') ? [searchParams.get('experience')] : [],
    salary: searchParams.get('salary') || '',
    category: searchParams.get('category') || '',
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: searchTerm,
        page,
        limit: 8,
      };

      if (filters.type.length > 0) {
        params.type = filters.type.join(',');
      }
      if (filters.experience.length > 0) {
        params.experience = filters.experience.join(',');
      }
      if (filters.salary) {
        params.salary = filters.salary;
      }
      if (filters.category) {
        params.category = filters.category;
      }

      const res = await jobsAPI.getJobs(params);
      if (res.success) {
        setJobs(res.jobs);
        setTotalPages(res.totalPages || 1);
        setTotalJobs(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, filters, page]);

  const handleFilterChange = (category, value) => {
    setPage(1);
    const newFilters = { ...filters };
    if (category === 'salary') {
      newFilters.salary = newFilters.salary === value ? '' : value;
    } else {
      const index = newFilters[category].indexOf(value);
      if (index > -1) {
        newFilters[category].splice(index, 1);
      } else {
        newFilters[category].push(value);
      }
    }
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({ type: [], experience: [], salary: '', category: '' });
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="jobs-page container animate-fade-in">
      <div className="jobs-header">
        <div>
          <h1 className="page-title">Find Your Next <span className="gradient-text">Opportunity</span></h1>
          <p className="page-subtitle">Showing {totalJobs} jobs available</p>
        </div>
        
        <div className="jobs-search-bar glass-panel">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by job title, company, or keywords"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          <button 
            type="button"
            className="btn btn-outline filter-toggle mobile-only"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="jobs-layout">
        <aside className={`filters-sidebar glass-panel ${showFilters ? 'show' : ''}`}>
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="clear-btn" onClick={clearAllFilters}>Clear All</button>
          </div>

          {filters.category && (
            <div className="active-filter-badge mb-md">
              <span>Category: <strong>{filters.category}</strong></span>
              <button onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}>✕</button>
            </div>
          )}
          
          <div className="filter-group">
            <h4 className="filter-title">Job Type</h4>
            {['Full Time', 'Part Time', 'Contract', 'Freelance'].map((t) => (
              <label key={t} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filters.type.includes(t)} 
                  onChange={() => handleFilterChange('type', t)} 
                />
                <span>{t}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Experience Level</h4>
            {['Entry Level', 'Mid Level', 'Senior Level'].map((exp) => (
              <label key={exp} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filters.experience.includes(exp)} 
                  onChange={() => handleFilterChange('experience', exp)} 
                />
                <span>{exp}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Salary Range</h4>
            {['Under $50k', '$50k - $100k', 'Over $100k'].map((sal) => (
              <label key={sal} className="radio-label">
                <input 
                  type="radio" 
                  name="salary" 
                  checked={filters.salary === sal} 
                  onChange={() => handleFilterChange('salary', sal)} 
                />
                <span>{sal}</span>
              </label>
            ))}
          </div>
        </aside>

        <main className="jobs-list">
          {loading ? (
            <div className="loading-container glass-panel text-center py-2xl">
              <Loader2 className="animate-spin text-primary mx-auto mb-md" size={32} />
              <p className="text-muted">Fetching matching opportunities...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-jobs glass-panel text-center py-2xl">
              <Search size={48} className="text-muted mx-auto mb-md opacity-40" />
              <h3>No jobs found matching your criteria</h3>
              <p className="text-muted mb-lg">Try adjusting your search terms or clearing your filters.</p>
              <button className="btn btn-outline" onClick={clearAllFilters}>
                <RefreshCw size={16} className="mr-sm" /> Reset Filters
              </button>
            </div>
          ) : (
            <>
              {jobs.map((job) => (
                <JobCard key={job.id || job._id} job={job} />
              ))}
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="btn btn-outline" 
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i + 1}
                      className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    className="btn btn-outline" 
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
