import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';
import { API_URL } from '../config';

// Load Stripe Promise
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock'
);

const CheckoutForm = ({ clientSecret, paymentIntentId, totalAmount, isDemoMode, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { cartItems } = useCart();

  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);
    setError('');

    try {
      if (isDemoMode || !stripe || !elements) {
        // Fallback Demo Payment flow
        console.log('Processing payment in Sandbox Demo mode...');
        
        // Simulating artificial delay for premium look and feel
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await fetch(`${API_URL}/payment/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentIntentId }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Payment confirmation failed');
        }

        if (data.success) {
          navigate(`/checkout-success?session_id=${paymentIntentId}`);
        }
        return;
      }

      // Real Stripe Payment flow
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Confirm payment status with backend
        const response = await fetch(`${API_URL}/payment/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentIntentId: result.paymentIntent.id }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Order update failed after Stripe confirmation');
        }

        if (data.success) {
          navigate(`/checkout-success?session_id=${result.paymentIntent.id}`);
        }
      }
    } catch (err) {
      setError(err.message || 'Transaction failed. Please try again.');
      setLoading(false);
    }
  };

  // CardElement custom premium styling matching our glassmorphism theme
  const cardElementOptions = {
    style: {
      base: {
        color: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#64748B',
        },
        iconColor: '#4F46E5',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-payment-form">
      <h3>Credit Card Payment</h3>
      
      {error && <div className="error-banner">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="cardname">Cardholder Name</label>
        <input
          id="cardname"
          className="form-input"
          type="text"
          required
          placeholder="e.g. Jane Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
        />
      </div>

      <div className="form-group stripe-card-wrapper">
        <label className="form-label">Card Details</label>
        <div className="card-input-container">
          {isDemoMode ? (
            <div className="demo-payment-prompt">
              <span className="demo-chip">DEMO MODE ACTIVE</span>
              <p>Stripe sandbox keys not configured. Click pay to complete the mock order.</p>
            </div>
          ) : (
            <CardElement options={cardElementOptions} />
          )}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary submit-checkout-btn"
        disabled={loading || (!isDemoMode && (!stripe || !elements))}
      >
        {loading ? 'Verifying payment...' : `Pay $${totalAmount.toFixed(2)}`}
      </button>

      <p className="checkout-note">
        🔒 SSL Encrypted card details processed in-app securely by Stripe.
      </p>
    </form>
  );
};

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  console.log('Stripe Publishable Key loaded in browser:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const [intentData, setIntentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const startPaymentIntent = async () => {
      try {
        const response = await fetch(`${API_URL}/payment/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cartItems }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Could not connect to payment backend');
        }

        setIntentData(data);
      } catch (err) {
        setError(err.message || 'Payment initiation failed.');
      } finally {
        setLoading(false);
      }
    };

    startPaymentIntent();
  }, [user, cartItems, token, navigate]);

  return (
    <div className="checkout-page animate-fade-in">
      <div className="checkout-layout">
        
        {/* Left Side: Checkout Form */}
        <div className="checkout-form-section glass-panel">
          <h2>Secure Checkout</h2>
          
          {loading ? (
            <div className="checkout-spinner-container">
              <div className="spinner"></div>
              <p>Preparing secure environment...</p>
            </div>
          ) : error ? (
            <div className="checkout-error-panel">
              <h3>Initiation Failure</h3>
              <p>{error}</p>
              <Link to="/cart" className="btn btn-secondary">Return to Cart</Link>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                clientSecret={intentData.clientSecret}
                paymentIntentId={intentData.paymentIntentId}
                totalAmount={intentData.totalAmount}
                isDemoMode={intentData.isDemoMode}
                orderId={intentData.orderId}
              />
            </Elements>
          )}
        </div>

        {/* Right Side: Order Summary */}
        <div className="checkout-summary-section glass-panel">
          <h3>Items Summary</h3>
          <div className="checkout-summary-list">
            {cartItems.map((itm) => (
              <div key={itm._id} className="checkout-summary-item">
                <img src={itm.imageUrl} alt={itm.name} className="summary-item-img" />
                <div className="summary-item-info">
                  <span className="summary-item-name">{itm.name}</span>
                  <span className="summary-item-qty">Qty: {itm.quantity}</span>
                </div>
                <span className="summary-item-total">${(itm.price * itm.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="checkout-summary-total">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-tag">FREE</span>
            </div>
            <div className="summary-total-row">
              <span>Amount Due</span>
              <span className="due-amount">${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
