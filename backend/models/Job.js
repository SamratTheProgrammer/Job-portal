import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    salary: {
      type: String,
      required: [true, 'Salary is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'],
      default: 'Full Time',
    },
    experience: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level'],
      default: 'Mid Level',
    },
    category: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    logo: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=Company&background=0D8ABC&color=fff&rounded=true',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Add text indexes for search functionality
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
  location: 'text',
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
