import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">AURA<span className="gradient-text">SHOP</span></span>
        </Link>

        <div className="navbar-links">
          {(!user || !user.isAdmin) && (
            <>
              <Link to="/" className="nav-link">Shop</Link>
              
              <Link to="/cart" className="nav-link cart-link">
                <span>Cart</span>
                {getCartCount() > 0 && (
                  <span className="cart-badge">{getCartCount()}</span>
                )}
              </Link>
            </>
          )}

          {user && user.isAdmin && (
            <Link to="/admin" className="nav-link admin-btn">
              Dashboard
            </Link>
          )}

          {user ? (
            <div className="user-profile">
              <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary login-btn-nav">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
