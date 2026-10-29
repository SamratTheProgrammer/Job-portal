import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private
export const applyJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { fullName, email, resumeUrl, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this job',
      });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      fullName: fullName || req.user.name,
      email: email || req.user.email,
      resumeUrl: resumeUrl || req.user.resumeUrl || 'https://resume.example.com',
      coverLetter: coverLetter || '',
      status: 'Applied',
    });

    // Increment applicantsCount on Job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    // If user doesn't have resumeUrl saved, save it
    if (resumeUrl && !req.user.resumeUrl) {
      await User.findByIdAndUpdate(req.user._id, { resumeUrl });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications submitted by the logged-in candidate
// @route   GET /api/applications/my
// @access  Private
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        select: 'title company logo location salary type tags posted status createdAt',
      })
      .sort('-createdAt');

    // Filter out applications where job might have been deleted
    const validApplications = applications.filter((app) => app.job != null);

    res.status(200).json({
      success: true,
      count: validApplications.length,
      applications: validApplications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a job (Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this job',
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email avatar title phone location resumeUrl')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Employer/Admin)
// @route   PATCH /api/applications/:id/status
// @access  Private
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (
      application.job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update application status for this job',
      });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application marked as ${application.status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};
