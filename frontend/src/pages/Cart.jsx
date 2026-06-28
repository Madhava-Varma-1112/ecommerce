import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login first, preserving the redirect target page
      navigate('/login', { state: { from: '/cart' } });
    } else {
      // Redirect to our internal in-app checkout page
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-page animate-fade-in">
      <h2>Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart glass-panel">
          <h3>Your cart is empty</h3>
          <p>Explore our premium catalog to add some essentials.</p>
          <Link to="/" className="btn btn-primary shop-now-btn">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item glass-panel">
                <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                
                <div className="cart-item-details">
                  <Link to={`/products/${item._id}`}>
                    <h3 className="cart-item-name">{item.name}</h3>
                  </Link>
                  <span className="cart-item-category">{item.category}</span>
                  <span className="cart-item-price-unit">${item.price.toFixed(2)}</span>
                </div>

                <div className="cart-item-actions">
                  <div className="qty-controls">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="remove-btn"
                    title="Remove item"
                  >
                    🗑️ Remove
                  </button>
                </div>

                <div className="cart-item-total">
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-section glass-panel">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="summary-row">
              <span>Taxes (Estimated)</span>
              <span>$0.00</span>
            </div>
            
            <div className="summary-total-row">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary checkout-btn"
            >
              Proceed to Checkout
            </button>
            
            <p className="payment-security-notice">
              🔒 Safe & Secure Checkout processed by Stripe Sandbox
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
