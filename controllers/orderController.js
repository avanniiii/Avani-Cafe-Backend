import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

// @desc    Create a new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress, phoneNumber, paymentMethod, notes } = req.body;
        
        // Get user's cart
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot create order with empty cart"
            });
        }
        
        // Create new order from cart
        const order = new Order({
            user: userId,
            items: cart.items.map(item => ({
                food: item.food,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image
            })),
            totalAmount: cart.totalAmount,
            shippingAddress,
            phoneNumber,
            paymentMethod,
            notes: notes || "",
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            orderStatus: 'pending'
        });
        
        await order.save();
        
        // Clear the cart after order is created
        cart.items = [];
        await cart.save();
        
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create order"
        });
    }
};

// @desc    Get all orders for user
// @route   GET /api/orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get orders"
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        // Check if user is authorized to view this order
        // Users can view their own orders, admins can view any order
        if (order.user.toString() !== userId.toString() && req.user.role !== 'admin' && req.user.role !== 'seller') {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this order"
            });
        }
        
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get order"
        });
    }
};

// @desc    Get all orders (admin/seller only)
// @route   GET /api/orders/all
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get all orders"
        });
    }
};

// @desc    Update order status (admin/seller only)
// @route   PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { orderStatus, paymentStatus } = req.body;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        // Update order status if provided
        if (orderStatus) {
            order.orderStatus = orderStatus;
            
            // Update delivered or canceled date if applicable
            if (orderStatus === 'delivered') {
                order.deliveredAt = Date.now();
            } else if (orderStatus === 'canceled') {
                order.canceledAt = Date.now();
            }
        }
        
        // Update payment status if provided
        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }
        
        await order.save();
        
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update order status"
        });
    }
};

// @desc    Complete an order (admin/seller only)
// @route   PUT /api/orders/:id/complete
// @access  Admin/Seller
const completeOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        // Can only complete orders that are delivered
        if (order.orderStatus !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: "Order must be delivered before it can be completed"
            });
        }
        
        // Update completion status
        order.isCompleted = true;
        order.completedAt = Date.now();
        
        await order.save();
        
        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Complete order error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to complete order"
        });
    }
};

export { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    getAllOrders, 
    updateOrderStatus, 
    completeOrder 
}; 