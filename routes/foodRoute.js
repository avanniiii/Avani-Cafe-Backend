import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    getAllFood,
    getFoodById,
    getFoodByCategory,
    createFood,
    updateFood,
    deleteFood
} from '../controllers/foodController.js';

const foodRouter = express.Router();

// Public routes
foodRouter.get('/', getAllFood);
foodRouter.get('/:id', getFoodById);
foodRouter.get('/category/:category', getFoodByCategory);

// Protected routes - Only admin can modify food items
foodRouter.post('/', protect, checkRole(['admin']), upload.single('image'), createFood);
foodRouter.put('/:id', protect, checkRole(['admin']), upload.single('image'), updateFood);
foodRouter.delete('/:id', protect, checkRole(['admin']), deleteFood);

export default foodRouter;