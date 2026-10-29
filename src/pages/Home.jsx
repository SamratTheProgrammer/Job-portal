import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Code, Palette, Megaphone, TrendingUp, Headphones, Sparkles } from 'lucide-react';
import JobCard from '../components/JobCard';
import { jobsAPI } from '../services/api';
import './Home.css';

const categoryIcons = {
  Code: Code,
  Palette: Palette,
  Megaphone: Megaphone,
  Briefcase: Briefcase,
  TrendingUp: TrendingUp,
  Headphones: Headphones,
};

const Home = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, featRes] = await Promise.all([
          jobsAPI.getCategories(),
          jobsAPI.getFeatured(),
        ]);
        if (catRes.categories) setCategories(catRes.categories);
        if (featRes.jobs) setFeaturedJobs(featRes.jobs.slice(0, 4));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/jobs?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="glow glow-1"></div>
          <div className="glow glow-2"></div>
        </div>
        <div className="container hero-content">
          <div className="badge-pill mb-md animate-fade-in">
            <Sparkles size={16} className="text-primary mr-sm" /> 
            <span>Over 1,000+ verified career opportunities live now</span>
          </div>

          <h1 className="hero-title animate-fade-in">
            Find Your Dream Job with <br /><span className="gradient-text">HireNova</span>
          </h1>
          <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Discover thousands of career opportunities with all the salary and role insights you need to take the next step.
          </p>
          
          <form className="search-bar glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }} onSubmit={handleSearch}>
            <div className="search-input-group">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Job title, skills, or company" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="divider"></div>
            <div className="search-input-group">
              <MapPin className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="City, remote, or state" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary search-btn">Find Jobs</button>
          </form>

          <div className="popular-searches animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span>Popular:</span>
            <button type="button" className="btn-link" onClick={() => navigate('/jobs?keyword=Frontend')}>Frontend</button>
            <button type="button" className="btn-link" onClick={() => navigate('/jobs?keyword=Designer')}>Product Design</button>
            <button type="button" className="btn-link" onClick={() => navigate('/jobs?keyword=React')}>React Native</button>
            <button type="button" className="btn-link" onClick={() => navigate('/jobs?keyword=Backend')}>Node.js</button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section container">
        <div className="section-header">
          <h2 className="section-title">Explore by <span className="gradient-text">Category</span></h2>
          <p className="section-subtitle">Find the exact path that fits your craft and ambitions</p>
        </div>
        
        <div className="categories-grid">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.icon] || Briefcase;
            return (
              <div 
                key={category.id || category.name} 
                className="category-card glass-panel clickable"
                onClick={() => handleCategoryClick(category.name)}
                role="button"
                tabIndex={0}
              >
                <div className="category-icon-wrapper">
                  <IconComponent size={24} className="category-icon" />
                </div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">{category.count} Open Positions</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-jobs-section container">
        <div className="section-header">
          <h2 className="section-title">Featured <span className="gradient-text">Opportunities</span></h2>
          <p className="section-subtitle">Hand-picked roles from world-class tech companies</p>
        </div>
        
        {loading ? (
          <div className="text-center py-xl">
            <p className="text-muted">Loading opportunities...</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {featuredJobs.map(job => (
              <JobCard key={job.id || job._id} job={job} />
            ))}
          </div>
        )}
        
        <div className="view-all-container">
          <button className="btn btn-outline" onClick={() => navigate('/jobs')}>
            View All Open Jobs
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
