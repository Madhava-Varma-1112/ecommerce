import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutSuccess.css';
import { API_URL } from '../config';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  
  // Ref to prevent double calls in React StrictMode
  const confirmationStarted = useRef(false);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !token) {
        setLoading(false);
        setError('Missing Session ID or Authorization details.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/payment/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Payment confirmation failed');
        }

        if (data.success) {
          setOrder(data.order);
          clearCart(); // Payment verified, clear the cart!
        }
      } catch (err) {
        setError(err.message || 'Error completing checkout payment verification.');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && token && !confirmationStarted.current) {
      confirmationStarted.current = true;
      confirmPayment();
    }
  }, [sessionId, token, clearCart]);

  return (
    <div className="success-page animate-fade-in">
      <div className="success-container glass-panel">
        {loading ? (
          <div className="success-loading-state">
            <div className="spinner"></div>
            <h3>Verifying Payment Status</h3>
            <p>Please wait a moment while we process your transaction details with Stripe...</p>
          </div>
        ) : error ? (
          <div className="success-error-state">
            <span className="error-icon">⚠️</span>
            <h3>Checkout Issue</h3>
            <p>{error}</p>
            <div className="success-actions">
              <Link to="/cart" className="btn btn-primary">
                Return to Cart
              </Link>
            </div>
          </div>
        ) : (
          <div className="success-content-state">
            <div className="success-icon-wrapper">
              <span className="success-icon">✓</span>
            </div>
            <h2>Payment Successful!</h2>
            <p className="sub-tag">Thank you for your order. Your payment was verified successfully.</p>
            
            {order && (
              <div className="order-details-box">
                <div className="order-header-row">
                  <span>Order Reference:</span>
                  <span className="order-id">{order._id}</span>
                </div>
                
                <div className="order-items-summary">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="success-item-row">
                      <span>{item.name} <span className="item-qty">x{item.quantity}</span></span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-total-row">
                  <span>Total Amount Paid</span>
                  <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="success-actions">
              <Link to="/" className="btn btn-primary">
                Continue Shopping
              </Link>
              {token && (
                <Link to="/admin" className="btn btn-secondary">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
