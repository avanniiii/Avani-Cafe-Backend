import express from 'express';
import { getUserCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const cartRouter = express.Router();

// All cart routes require authentication
cartRouter.use(protect);

// Get user cart and add to cart
cartRouter.route('/')
    .get(getUserCart)
    .post(addToCart)
    .delete(clearCart);

// Update and delete cart items
cartRouter.route('/:itemId')
    .put(updateCartItem)
    .delete(removeCartItem);

export default cartRouter; 