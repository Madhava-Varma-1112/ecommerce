import express from 'express';
import { protect } from '../middleware/auth.js';
import { registerUser, authUser, getUserProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getUserProfile);

export default router;
