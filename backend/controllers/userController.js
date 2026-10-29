import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      title,
      bio,
      phone,
      location,
      skills,
      resumeUrl,
      avatar,
      companyName,
      companyWebsite,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (avatar) user.avatar = avatar;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (companyName !== undefined) user.companyName = companyName;
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;

    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        title: updatedUser.title,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
        resumeUrl: updatedUser.resumeUrl,
        skills: updatedUser.skills,
        companyName: updatedUser.companyName,
        companyWebsite: updatedUser.companyWebsite,
        savedJobs: updatedUser.savedJobs,
        notificationPreferences: updatedUser.notificationPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account settings & password
// @route   PUT /api/users/settings
// @access  Private
export const updateSettings = async (req, res, next) => {
  try {
    const {
      currentPassword,
      newPassword,
      notificationPreferences,
    } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Change password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current password to set a new password',
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      user.password = newPassword;
    }

    // Update notifications
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Save/Bookmark a job
// @route   POST /api/users/save-job/:jobId
// @access  Private
export const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const user = await User.findById(req.user._id);

    const isSaved = user.savedJobs.some((id) => id.toString() === jobId.toString());

    if (isSaved) {
      // Remove from saved
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId.toString());
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Job removed from saved jobs',
        isSaved: false,
      });
    } else {
      // Add to saved
      user.savedJobs.push(jobId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Job saved successfully',
        isSaved: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for current user
// @route   GET /api/users/saved-jobs
// @access  Private
export const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      match: { status: 'active' },
      select: 'title company logo location salary type tags posted createdAt',
    });

    const formattedSavedJobs = (user.savedJobs || []).map((job) => {
      const jobObj = job.toObject();
      return {
        ...jobObj,
        id: jobObj._id.toString(),
        isSaved: true,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedSavedJobs.length,
      savedJobs: formattedSavedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const appliedCount = await Application.countDocuments({ applicant: req.user._id });
    const savedCount = user.savedJobs ? user.savedJobs.length : 0;
    const interviewCount = await Application.countDocuments({
      applicant: req.user._id,
      status: 'Interview',
    });

    // If employer, compute posted jobs & applicants
    let employerStats = null;
    if (user.role === 'employer' || user.role === 'admin') {
      const postedJobsCount = await Job.countDocuments({ postedBy: req.user._id });
      const userJobIds = await Job.find({ postedBy: req.user._id }).select('_id');
      const totalApplicantsCount = await Application.countDocuments({
        job: { $in: userJobIds.map((j) => j._id) },
      });
      employerStats = {
        postedJobsCount,
        totalApplicantsCount,
      };
    }

    res.status(200).json({
      success: true,
      stats: {
        appliedCount,
        savedCount,
        interviewCount,
        alertsCount: 4,
        employerStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
