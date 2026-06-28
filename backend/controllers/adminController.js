import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get dashboard metrics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    // 1. Calculate total revenue from paid orders
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Count metrics
    const totalOrdersCount = paidOrders.length;
    const totalProductsCount = await Product.countDocuments();
    const totalUsersCount = await User.countDocuments();

    // 3. Get recent orders (populate user name and email)
    const recentOrders = await Order.find({ paymentStatus: 'paid' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // 4. Get product counts by category
    const products = await Product.find({});
    const categoryBreakdown = {};
    products.forEach((p) => {
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    });

    res.json({
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders: totalOrdersCount,
        totalProducts: totalProductsCount,
        totalUsers: totalUsersCount,
      },
      recentOrders,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};
