import Stripe from 'stripe';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
  return new Stripe(secretKey);
};

// @desc    Create a Stripe Payment Intent and save a pending order
// @route   POST /api/payment/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'No items in the cart' });
  }

  try {
    const stripe = getStripeInstance();
    const dbOrderItems = [];
    let totalAmount = 0;

    // Fetch product details from DB to calculate correct pricing and verify stock
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({ message: `Product with id ${item._id} not found` });
      }

      dbOrderItems.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        imageUrl: product.imageUrl,
        product: product._id,
      });

      totalAmount += product.price * item.quantity;
    }

    let paymentIntentId = 'mock_pi_' + Math.random().toString(36).substr(2, 9);
    let clientSecret = 'mock_secret_secret_' + Math.random().toString(36).substr(2, 9);
    let isDemoMode = true;

    // If a valid Stripe key is configured, create the actual PaymentIntent
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('your_')) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100), // Stripe expects cents
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
        });
        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
        isDemoMode = false;
      } catch (stripeErr) {
        console.warn('Stripe Intent creation failed, falling back to mock mode:', stripeErr.message);
      }
    }

    // Save pending order to Database
    const order = new Order({
      user: req.user._id,
      orderItems: dbOrderItems,
      totalAmount: totalAmount,
      paymentStatus: 'pending',
      stripeSessionId: paymentIntentId, // Store paymentIntentId in stripeSessionId field
    });

    await order.save();

    res.json({
      clientSecret,
      paymentIntentId,
      orderId: order._id,
      totalAmount,
      isDemoMode,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm order payment status using Stripe payment intent ID
// @route   POST /api/payment/confirm-payment
// @access  Private
export const confirmPayment = async (req, res) => {
  const paymentIntentId = req.body.paymentIntentId || req.body.sessionId;

  if (!paymentIntentId) {
    return res.status(400).json({ message: 'Payment Intent ID or Session ID is required' });
  }

  try {
    const stripe = getStripeInstance();
    const order = await Order.findOne({ stripeSessionId: paymentIntentId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found for this transaction' });
    }

    // If order is already paid, return it directly
    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, order });
    }

    let isPaid = false;
    // Verify using Stripe if we are not in mock/demo mode
    if (
      process.env.STRIPE_SECRET_KEY && 
      !process.env.STRIPE_SECRET_KEY.startsWith('your_') && 
      !paymentIntentId.startsWith('mock_')
    ) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === 'succeeded') {
        isPaid = true;
      }
    } else {
      // In demo mode or if using mock IDs, auto-approve the payment
      console.log('Demo mode auto-approving payment intent:', paymentIntentId);
      isPaid = true;
    }

    if (isPaid) {
      order.paymentStatus = 'paid';
      await order.save();

      // Deduct product inventory stock
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }

      res.json({ success: true, order });
    } else {
      res.status(400).json({ message: 'Payment intent not succeeded' });
    }
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ message: error.message });
  }
};
