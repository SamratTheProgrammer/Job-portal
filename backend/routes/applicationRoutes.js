import express from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:jobId', protect, applyJob);
router.get('/my', protect, getMyApplications);
router.get('/job/:jobId', protect, getJobApplications);
router.patch('/:id/status', protect, updateApplicationStatus);

export default router;
