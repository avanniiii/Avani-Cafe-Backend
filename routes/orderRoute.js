import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    completeOrder
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// All order routes require authentication
orderRouter.use(protect);

// User order routes
orderRouter.route('/')
    .post(createOrder)
    .get(getUserOrders);

// Admin/Seller routes - Make sure these come BEFORE the /:id route to prevent conflicts
orderRouter.route('/all')
    .get(checkRole(['admin', 'seller']), getAllOrders);

// Individual order routes
orderRouter.route('/:id')
    .get(getOrderById);

orderRouter.route('/:id/status')
    .put(checkRole(['admin', 'seller']), updateOrderStatus);

orderRouter.route('/:id/complete')
    .put(checkRole(['admin', 'seller']), completeOrder);

export default orderRouter; 