import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Admin only
export const getDashboardData = async (req, res) => {
    try {
        // Get total users (with buyer role)
        const totalUsers = await User.countDocuments({ role: 'buyer' });
        
        // Get total sellers
        const totalSellers = await User.countDocuments({ role: 'seller' });
        
        // Get total orders
        const totalOrders = await Order.countDocuments();
        
        // Get total revenue
        const orders = await Order.find();
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        
        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');
            
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalSellers,
                totalOrders,
                totalRevenue,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Admin dashboard data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
};

// @desc    Get all users (excluding sellers and admins)
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req, res) => {
    try {
        // Get regular users (with buyer role, which is the default)
        const users = await User.find({ role: 'buyer' })
            .select('name email role createdAt')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Admin only
export const getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' })
            .select('name email role createdAt')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            data: sellers
        });
    } catch (error) {
        console.error('Get all sellers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sellers'
        });
    }
}; 