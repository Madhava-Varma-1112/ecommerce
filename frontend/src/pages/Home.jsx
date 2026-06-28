import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Home.css';
import { API_URL } from '../config';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch products');
        }
        
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault(); // Prevent navigating to detail page if user clicks add to cart button directly
    addToCart(product, 1);
    setToastMessage(`Added ${product.name} to cart!`);
    setTimeout(() => setToastMessage(''), 2000);
  };

  return (
    <div className="home-page animate-fade-in">
      {toastMessage && (
        <div className="notification">
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="home-hero">
        <h1>Discover Premium Essentials</h1>
        <p>Curated design items engineered for modern workspaces and daily carry.</p>
      </header>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-container glass-panel">
          <h3>Failed to load products</h3>
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-catalog glass-panel animate-fade-in">
          <h3>No Products Available</h3>
          <p>We are stocking up! Please check back later, or log in as an administrator to create products.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card glass-panel animate-fade-in">
              <Link to={`/products/${product._id}`} className="product-card-link">
                <div className="product-image-wrapper">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                  <span className="product-category-tag">{product.category}</span>
                </div>
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-footer">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="btn btn-primary add-to-cart-quick-btn"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
