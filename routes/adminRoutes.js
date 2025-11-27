import express from 'express';
import { getDashboardData, getAllUsers, getAllSellers } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const adminRouter = express.Router();

// All admin routes require authentication and admin role
adminRouter.use(protect);
adminRouter.use(checkRole(['admin']));

// Dashboard route
adminRouter.get('/dashboard', getDashboardData);

// User management routes
adminRouter.get('/users', getAllUsers);
adminRouter.get('/sellers', getAllSellers);

export default adminRouter; 