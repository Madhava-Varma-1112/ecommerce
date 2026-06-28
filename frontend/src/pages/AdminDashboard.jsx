import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';
import { API_URL } from '../config';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Dashboard Stats and Products
  const fetchData = async () => {
    try {
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();

      const productsRes = await fetch(`${API_URL}/products`);
      const productsData = await productsRes.json();

      if (!statsRes.ok) {
        throw new Error(statsData.message || 'Failed to fetch admin stats');
      }
      if (!productsRes.ok) {
        throw new Error(productsData.message || 'Failed to fetch products');
      }

      setStats(statsData);
      setProducts(productsData);
    } catch (err) {
      setError(err.message || 'Error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate, token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please upload a product image.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('stock', stock);
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      setSuccessMsg('Product created successfully!');
      
      // Reset Form fields
      setName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setStock('');
      setImageFile(null);
      setImagePreview('');

      // Refresh Data
      fetchData();
    } catch (err) {
      setError(err.message || 'Error uploading product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      setSuccessMsg('Product deleted successfully!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Error deleting product.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || !user.isAdmin) {
    return <div className="spinner-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header-row">
        <h2>Admin Management</h2>
        <span className="admin-badge">System Administrator</span>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : (
        <>
          {/* Metrics Panel */}
          {stats && (
            <div className="metrics-grid">
              <div className="metric-card glass-panel">
                <span className="metric-icon">💰</span>
                <div className="metric-info">
                  <span className="metric-label">Total Revenue</span>
                  <span className="metric-value">${stats.metrics.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
              <div className="metric-card glass-panel">
                <span className="metric-icon">📦</span>
                <div className="metric-info">
                  <span className="metric-label">Total Orders</span>
                  <span className="metric-value">{stats.metrics.totalOrders}</span>
                </div>
              </div>
              <div className="metric-card glass-panel">
                <span className="metric-icon">🏷️</span>
                <div className="metric-info">
                  <span className="metric-label">Products Active</span>
                  <span className="metric-value">{stats.metrics.totalProducts}</span>
                </div>
              </div>
              <div className="metric-card glass-panel">
                <span className="metric-icon">👥</span>
                <div className="metric-info">
                  <span className="metric-label">Total Users</span>
                  <span className="metric-value">{stats.metrics.totalUsers}</span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Panel Layout */}
          <div className="admin-panel-layout">
            
            {/* Create Product Section */}
            <div className="admin-section glass-panel">
              <h3>Create New Product</h3>
              
              <form className="admin-form" onSubmit={handleCreateProduct}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pname">Product Name</label>
                  <input
                    id="pname"
                    className="form-input"
                    type="text"
                    required
                    placeholder="e.g. Mechanical Keyboard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pprice">Price ($)</label>
                    <input
                      id="pprice"
                      className="form-input"
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 129.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pstock">Stock Qty</label>
                    <input
                      id="pstock"
                      className="form-input"
                      type="number"
                      required
                      placeholder="e.g. 25"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="pcategory">Category</label>
                    <input
                      id="pcategory"
                      className="form-input"
                      type="text"
                      required
                      placeholder="e.g. Electronics"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pimage">Product Image File</label>
                    <input
                      id="pimage"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleImageChange}
                      className="file-input-custom"
                    />
                  </div>
                </div>

                {imagePreview && (
                  <div className="image-upload-preview-box">
                    <img src={imagePreview} alt="Preview" className="upload-preview" />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="pdesc">Description</label>
                  <textarea
                    id="pdesc"
                    className="form-input text-area-input"
                    rows="3"
                    required
                    placeholder="Detailed information about the product..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary submit-product-btn"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Creating in Cloudinary...' : 'Create Product'}
                </button>
              </form>
            </div>

            {/* Recent Orders Log */}
            <div className="admin-section glass-panel">
              <h3>Recent Paid Purchases</h3>
              
              {stats && stats.recentOrders.length === 0 ? (
                <p className="no-records-text">No purchases recorded yet.</p>
              ) : (
                <div className="recent-orders-list">
                  {stats && stats.recentOrders.map((ord) => (
                    <div key={ord._id} className="order-log-card">
                      <div className="order-log-header">
                        <span className="order-log-user">{ord.user?.name || 'Guest User'}</span>
                        <span className="order-log-price">${ord.totalAmount.toFixed(2)}</span>
                      </div>
                      
                      <div className="order-log-items">
                        {ord.orderItems.map((itm, i) => (
                          <span key={i} className="order-log-item-tag">
                            {itm.name} (x{itm.quantity})
                          </span>
                        ))}
                      </div>

                      <div className="order-log-footer">
                        <span className="order-log-date">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                        <span className="badge badge-success">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manage Products List */}
          <div className="admin-section product-management-section glass-panel">
            <h3>Inventory Stock Management</h3>
            
            {products.length === 0 ? (
              <p className="no-records-text">No products in inventory.</p>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Info</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id}>
                        <td>
                          <img src={prod.imageUrl} alt={prod.name} className="table-product-image" />
                        </td>
                        <td>
                          <div className="table-product-info-block">
                            <span className="table-product-name">{prod.name}</span>
                            <span className="table-product-id">ID: {prod._id}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{prod.category}</span>
                        </td>
                        <td className="table-product-price">${prod.price.toFixed(2)}</td>
                        <td>
                          <span className={`details-stock ${prod.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {prod.stock} left
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="btn btn-danger delete-table-btn"
                            disabled={actionLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
