import express from 'express';
import {
  updateProfile,
  updateSettings,
  toggleSaveJob,
  getSavedJobs,
  getDashboardStats,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.post('/save-job/:jobId', protect, toggleSaveJob);
router.get('/saved-jobs', protect, getSavedJobs);
router.get('/dashboard-stats', protect, getDashboardStats);

export default router;
