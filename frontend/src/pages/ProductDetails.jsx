import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch product details');
        }

        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQtyChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => prev + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setToastMessage(`Added ${quantity} ${product.name} to cart!`);
      setTimeout(() => setToastMessage(''), 2000);
    }
  };

  return (
    <div className="product-details-page animate-fade-in">
      {toastMessage && (
        <div className="notification">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="back-link-wrapper">
        <Link to="/" className="back-link">
          ← Back to Shop
        </Link>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-container glass-panel">
          <h3>Failed to load product</h3>
          <p>{error}</p>
        </div>
      ) : !product ? (
        <div className="error-container glass-panel">
          <h3>Product Not Found</h3>
        </div>
      ) : (
        <div className="details-container glass-panel">
          <div className="details-image-section">
            <img src={product.imageUrl} alt={product.name} className="details-image" />
          </div>

          <div className="details-info-section">
            <span className="details-category">{product.category}</span>
            <h1 className="details-title">{product.name}</h1>
            
            <div className="details-price-stock">
              <span className="details-price">${product.price.toFixed(2)}</span>
              <span className={`details-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <p className="details-description">{product.description}</p>

            <div className="details-actions">
              <div className="qty-selector">
                <span className="qty-label">Quantity</span>
                <div className="qty-controls">
                  <button onClick={() => handleQtyChange('dec')} className="qty-btn" disabled={quantity <= 1}>
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => handleQtyChange('inc')} className="qty-btn">
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary add-to-cart-btn"
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
