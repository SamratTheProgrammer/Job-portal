import express from 'express';
import {
  getJobs,
  getFeaturedJobs,
  getCategories,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/categories', getCategories);
router.get('/:id', optionalProtect, getJobById);
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

export default router;
