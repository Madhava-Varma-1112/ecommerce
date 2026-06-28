import express from 'express';
import { protect } from '../middleware/auth.js';
import { createPaymentIntent, confirmPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);

export default router;
