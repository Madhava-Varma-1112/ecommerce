import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { getAdminStats } from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', protect, admin, getAdminStats);

export default router;
