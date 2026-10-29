import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import Category from './models/Category.js';

dotenv.config();

const initialCategories = [
  { name: 'Engineering', icon: 'Code', description: 'Software engineering, DevOps, QA, and frontend/backend roles' },
  { name: 'Design', icon: 'Palette', description: 'UI/UX design, visual design, and brand identity' },
  { name: 'Marketing', icon: 'Megaphone', description: 'Digital marketing, growth hacking, SEO, and content creation' },
  { name: 'Product', icon: 'Briefcase', description: 'Product management, product owners, and strategy' },
  { name: 'Sales', icon: 'TrendingUp', description: 'B2B sales, account management, and business development' },
  { name: 'Customer Support', icon: 'Headphones', description: 'Customer success, support engineers, and client care' },
];

export const initialJobs = [
  {
    title: "Senior Frontend Engineer",
    company: "TechFlow Solutions",
    location: "San Francisco, CA (Hybrid)",
    salary: "$140k - $180k",
    type: "Full Time",
    experience: "Senior Level",
    category: "Engineering",
    logo: "https://ui-avatars.com/api/?name=TF&background=0D8ABC&color=fff&rounded=true",
    description: "We are looking for a Senior Frontend Engineer to lead the development of our core web applications using React, Vite, and modern CSS. You will be working closely with our design team to create premium, performant user experiences.",
    requirements: [
      "5+ years of experience with React and modern JavaScript.",
      "Strong understanding of CSS, animations, and responsive design.",
      "Experience with performance optimization.",
      "Excellent communication skills."
    ],
    tags: ["React", "JavaScript", "CSS"],
    isFeatured: true,
  },
  {
    title: "Product Designer",
    company: "Creative Studio",
    location: "Remote",
    salary: "$110k - $140k",
    type: "Full Time",
    experience: "Mid Level",
    category: "Design",
    logo: "https://ui-avatars.com/api/?name=CS&background=ff4d4f&color=fff&rounded=true",
    description: "Join our creative team to design intuitive and beautiful web and mobile applications. You will own the design process from concept to delivery.",
    requirements: [
      "Portfolio demonstrating strong UI/UX skills.",
      "Proficiency in Figma.",
      "Experience with design systems.",
      "Understanding of frontend constraints."
    ],
    tags: ["Figma", "UI/UX", "Prototyping"],
    isFeatured: true,
  },
  {
    title: "Backend Developer (Node.js)",
    company: "DataSync Inc",
    location: "New York, NY",
    salary: "$130k - $160k",
    type: "Contract",
    experience: "Senior Level",
    category: "Engineering",
    logo: "https://ui-avatars.com/api/?name=DS&background=52c41a&color=fff&rounded=true",
    description: "DataSync is looking for a strong Backend Developer to help scale our real-time data processing pipelines using Node.js and PostgreSQL.",
    requirements: [
      "3+ years of experience with Node.js.",
      "Strong database design skills (PostgreSQL, MongoDB, Redis).",
      "Experience building RESTful APIs.",
      "Familiarity with AWS or Google Cloud."
    ],
    tags: ["Node.js", "MongoDB", "AWS"],
    isFeatured: true,
  },
  {
    title: "Marketing Manager",
    company: "GrowthStack",
    location: "Austin, TX",
    salary: "$90k - $120k",
    type: "Full Time",
    experience: "Mid Level",
    category: "Marketing",
    logo: "https://ui-avatars.com/api/?name=GS&background=faad14&color=fff&rounded=true",
    description: "We are looking for a data-driven Marketing Manager to lead our user acquisition strategies.",
    requirements: [
      "Experience with B2B SaaS marketing.",
      "Strong analytical skills.",
      "Experience with SEO and paid campaigns."
    ],
    tags: ["Marketing", "SEO", "Analytics"],
    isFeatured: false,
  },
  {
    title: "React Native Developer",
    company: "AppWorks",
    location: "Remote",
    salary: "$120k - $150k",
    type: "Full Time",
    experience: "Mid Level",
    category: "Engineering",
    logo: "https://ui-avatars.com/api/?name=AW&background=1890ff&color=fff&rounded=true",
    description: "Help us build the next generation of mobile applications using React Native.",
    requirements: [
      "Experience shipping React Native apps to iOS and Android.",
      "Understanding of mobile UI/UX.",
      "Experience with state management (Redux, Zustand)."
    ],
    tags: ["React Native", "Mobile", "iOS", "Android"],
    isFeatured: true,
  },
  {
    title: "Full Stack Engineer",
    company: "CloudVibe Labs",
    location: "Seattle, WA (Remote)",
    salary: "$135k - $175k",
    type: "Full Time",
    experience: "Senior Level",
    category: "Engineering",
    logo: "https://ui-avatars.com/api/?name=CV&background=722ed1&color=fff&rounded=true",
    description: "CloudVibe Labs is seeking a Full Stack Engineer to architect modern cloud services and microfrontends with high throughput.",
    requirements: [
      "4+ years building full stack web applications.",
      "Proficiency in React, TypeScript, and Node.js.",
      "Hands-on experience with Docker and Kubernetes.",
      "Knowledge of CI/CD pipelines."
    ],
    tags: ["Full Stack", "TypeScript", "Node.js", "Docker"],
    isFeatured: true,
  },
  {
    title: "Associate Product Manager",
    company: "NextGen Media",
    location: "Boston, MA",
    salary: "$85k - $105k",
    type: "Full Time",
    experience: "Entry Level",
    category: "Product",
    logo: "https://ui-avatars.com/api/?name=NM&background=13c2c2&color=fff&rounded=true",
    description: "Work with cross-functional teams of designers and engineers to define, ship, and iterate on media products used by millions.",
    requirements: [
      "1-2 years experience in product coordination or software engineering.",
      "Strong analytical and user empathy mindset.",
      "Great presentation and writing skills."
    ],
    tags: ["Product", "Agile", "User Research"],
    isFeatured: false,
  },
  {
    title: "DevOps & Cloud Architect",
    company: "OmniScale Cloud",
    location: "Chicago, IL",
    salary: "$150k - $190k",
    type: "Full Time",
    experience: "Senior Level",
    category: "Engineering",
    logo: "https://ui-avatars.com/api/?name=OS&background=eb2f96&color=fff&rounded=true",
    description: "Design and maintain high-availability cloud infrastructure and security guardrails across AWS and Azure environments.",
    requirements: [
      "Deep expertise in Terraform and Infrastructure as Code.",
      "Extensive knowledge of AWS security, VPCs, and IAM.",
      "Experience managing production Kubernetes clusters."
    ],
    tags: ["DevOps", "AWS", "Terraform", "Kubernetes"],
    isFeatured: true,
  }
];

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected for seeding...');
    }

    // Check if jobs already exist
    const count = await Job.countDocuments();
    if (count > 0) {
      console.log(`Database already contains ${count} jobs. Skipping seed.`);
      return;
    }

    console.log('Clearing existing data...');
    await Job.deleteMany({});
    await Category.deleteMany({});

    // Create or find demo employer
    let employer = await User.findOne({ email: 'employer@hirenova.com' });
    if (!employer) {
      employer = await User.create({
        name: 'TechFlow Recruiter',
        email: 'employer@hirenova.com',
        password: 'password123',
        role: 'employer',
        title: 'Talent Acquisition Partner',
        companyName: 'TechFlow Solutions',
        avatar: 'https://ui-avatars.com/api/?name=TechFlow&background=0D8ABC&color=fff&rounded=true',
      });
      console.log('Created demo employer: employer@hirenova.com / password123');
    }

    // Create or find demo candidate (Alex Smith)
    let candidate = await User.findOne({ email: 'alex@hirenova.com' });
    if (!candidate) {
      candidate = await User.create({
        name: 'Alex Smith',
        email: 'alex@hirenova.com',
        password: 'password123',
        role: 'candidate',
        title: 'Senior Frontend Engineer',
        location: 'San Francisco, CA',
        phone: '+1 (555) 234-5678',
        bio: 'Passionate UI engineer crafting sleek, accessible web applications with React, Next.js, and CSS animations.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        resumeUrl: 'https://hirenova.com/resumes/alex-smith.pdf',
        skills: ['React', 'JavaScript', 'TypeScript', 'CSS/SCSS', 'HTML5', 'Node.js', 'Git'],
      });
      console.log('Created demo candidate: alex@hirenova.com / password123');
    }

    // Insert categories
    await Category.insertMany(initialCategories);
    console.log('Categories seeded.');

    // Insert jobs with postedBy employer
    const jobsToInsert = initialJobs.map((job) => ({
      ...job,
      postedBy: employer._id,
    }));

    const insertedJobs = await Job.insertMany(jobsToInsert);
    console.log(`Inserted ${insertedJobs.length} jobs.`);

    // Seed demo saved jobs and application for candidate
    if (insertedJobs.length >= 2) {
      // Save 2 jobs for candidate
      candidate.savedJobs = [insertedJobs[2]._id, insertedJobs[3]._id];
      await candidate.save();

      // Create applications for candidate
      await Application.create([
        {
          job: insertedJobs[0]._id,
          applicant: candidate._id,
          fullName: candidate.name,
          email: candidate.email,
          resumeUrl: candidate.resumeUrl,
          coverLetter: "I've been building modern web frontends for over 5 years and would love to bring my React and CSS design skills to TechFlow!",
          status: 'Reviewing',
        },
        {
          job: insertedJobs[1]._id,
          applicant: candidate._id,
          fullName: candidate.name,
          email: candidate.email,
          resumeUrl: candidate.resumeUrl,
          coverLetter: 'Excited about the product designer role and the vision of Creative Studio.',
          status: 'Applied',
        },
      ]);
      await Job.findByIdAndUpdate(insertedJobs[0]._id, { $inc: { applicantsCount: 1 } });
      await Job.findByIdAndUpdate(insertedJobs[1]._id, { $inc: { applicantsCount: 1 } });
      console.log('Demo applications and saved jobs seeded for Alex.');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// If run directly: node seed.js
if (process.argv[1]?.includes('seed.js')) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
