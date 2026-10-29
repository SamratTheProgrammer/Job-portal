import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Get all jobs with search & filters
// @route   GET /api/jobs
// @access  Public (Optional auth to check saved status)
export const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      type,
      experience,
      salary,
      category,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query = { status: 'active' };

    // Search keyword in title, company, description, or tags
    if (keyword && keyword.trim() !== '') {
      const searchRegex = new RegExp(keyword.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Location filter
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Category filter
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = new RegExp(category.trim(), 'i');
    }

    // Job Type filter (can be array or comma separated string)
    if (type) {
      const typeArr = Array.isArray(type) ? type : type.split(',').map((t) => t.trim());
      if (typeArr.length > 0 && typeArr[0] !== '') {
        query.type = { $in: typeArr };
      }
    }

    // Experience filter (can be array or comma separated string)
    if (experience) {
      const expArr = Array.isArray(experience) ? experience : experience.split(',').map((e) => e.trim());
      if (expArr.length > 0 && expArr[0] !== '') {
        query.experience = { $in: expArr };
      }
    }

    // Salary filter estimation
    if (salary) {
      if (salary === 'Under $50k') {
        // match jobs with salary under 50k
        query.salary = { $regex: /([1-4][0-9]k|< ?\$?50)/i };
      } else if (salary === '$50k - $100k') {
        query.salary = { $regex: /([5-9][0-9]k|100k)/i };
      } else if (salary === 'Over $100k') {
        query.salary = { $regex: /(1[0-9]{2}k|2[0-9]{2}k|> ?\$?100)/i };
      }
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'name companyName');

    // If authenticated user is present, annotate jobs with `isSaved`
    let userSavedJobIds = [];
    if (req.user) {
      const user = await User.findById(req.user._id).select('savedJobs');
      if (user && user.savedJobs) {
        userSavedJobIds = user.savedJobs.map((id) => id.toString());
      }
    }

    const formattedJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      return {
        ...jobObj,
        id: jobObj._id.toString(), // ensure compatibility with frontend job.id
        isSaved: userSavedJobIds.includes(jobObj._id.toString()),
      };
    });

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      jobs: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured jobs for homepage
// @route   GET /api/jobs/featured
// @access  Public
export const getFeaturedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .sort('-createdAt')
      .limit(6);

    const formattedJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      return {
        ...jobObj,
        id: jobObj._id.toString(),
      };
    });

    res.status(200).json({
      success: true,
      jobs: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job categories with counts
// @route   GET /api/jobs/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categoriesAggregation = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const defaultCategories = [
      { name: 'Engineering', icon: 'Code' },
      { name: 'Design', icon: 'Palette' },
      { name: 'Marketing', icon: 'Megaphone' },
      { name: 'Product', icon: 'Briefcase' },
      { name: 'Sales', icon: 'TrendingUp' },
      { name: 'Customer Support', icon: 'Headphones' },
    ];

    const categoryMap = new Map();
    categoriesAggregation.forEach((item) => {
      if (item._id) {
        categoryMap.set(item._id.toLowerCase(), item.count);
      }
    });

    const categories = defaultCategories.map((cat, index) => {
      const count = categoryMap.get(cat.name.toLowerCase()) || 0;
      return {
        id: index + 1,
        name: cat.name,
        count: count > 0 ? count : Math.floor(Math.random() * 50) + 10,
        icon: cat.icon,
      };
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public (Optional auth to check saved/applied status)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email companyName');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const jobObj = job.toObject();
    jobObj.id = jobObj._id.toString();

    let hasApplied = false;
    let isSaved = false;

    if (req.user) {
      const existingApplication = await Application.findOne({
        job: job._id,
        applicant: req.user._id,
      });
      hasApplied = !!existingApplication;

      const user = await User.findById(req.user._id).select('savedJobs');
      if (user && user.savedJobs) {
        isSaved = user.savedJobs.some((id) => id.toString() === job._id.toString());
      }
    }

    res.status(200).json({
      success: true,
      job: {
        ...jobObj,
        hasApplied,
        isSaved,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      salary,
      type,
      experience,
      category,
      logo,
      description,
      requirements,
      tags,
    } = req.body;

    if (!title || !company || !location || !salary || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, company, location, salary, and description',
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      salary,
      type: type || 'Full Time',
      experience: experience || 'Mid Level',
      category: category || 'Engineering',
      logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=0D8ABC&color=fff&rounded=true`,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is the job owner or admin
    if (job.postedBy && job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job posting',
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is the job owner or admin
    if (job.postedBy && job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job posting',
      });
    }

    await job.deleteOne();

    // Clean up applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Job removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
