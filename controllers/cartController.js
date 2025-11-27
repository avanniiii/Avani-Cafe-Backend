import Cart from "../models/cartModel.js";
import Food from "../models/foodModel.js";
import mongoose from "mongoose";

// @desc    Get user cart
// @route   GET /api/cart
const getUserCart = async (req, res) => {
    try {
        const userId = req.user._id;
        
        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            try {
                // Create an empty cart if the user doesn't have one
                cart = await Cart.create({
                    user: userId,
                    items: [],
                    totalAmount: 0,
                    totalItems: 0
                });
            } catch (createError) {
                // If there's a duplicate key error, try to find the cart again
                if (createError.code === 11000) {
                    cart = await Cart.findOne({ user: userId });
                    if (!cart) {
                        // If still no cart, try deleting existing ones and creating a new one
                        await Cart.deleteMany({ user: userId });
                        cart = await Cart.create({
                            user: userId,
                            items: [],
                            totalAmount: 0,
                            totalItems: 0
                        });
                    }
                } else {
                    throw createError;
                }
            }
        }
        
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve cart"
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            foodId, 
            quantity = 1,
            name,
            price,
            image,
            description,
            category
        } = req.body;
        
        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: "Food ID is required"
            });
        }
        
        let cart = await Cart.findOne({ user: userId });
        
        // Create a new cart if user doesn't have one
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                totalAmount: 0,
                totalItems: 0
            });
        }
        
        // Check if we have a valid MongoDB ObjectId or a frontend ID
        let isMongoId = false;
        try {
            isMongoId = mongoose.Types.ObjectId.isValid(foodId);
        } catch (err) {
            isMongoId = false;
        }
        
        let foodItem = null;
        
        // Only try to find the food item in the database if it's a valid ObjectId
        if (isMongoId) {
            foodItem = await Food.findById(foodId);
        }
        
        // If we couldn't find the food item or it's not a valid ObjectId,
        // use the provided details from the frontend
        if (!foodItem && name && price) {
            foodItem = {
                _id: foodId,
                name,
                price,
                image,
                description,
                category
            };
        } else if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: "Food item not found and insufficient details provided"
            });
        }
        
        // Check if item already exists in cart
        // For frontend items with string IDs, we'll use the foodId directly
        const itemIndex = cart.items.findIndex(item => 
            isMongoId 
                ? item.food.toString() === foodId 
                : item.food.toString() === foodId || item.name === name
        );
        
        if (itemIndex > -1) {
            // Item exists, update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Item doesn't exist, add new item
            cart.items.push({
                food: foodId,
                quantity,
                price: foodItem.price,
                name: foodItem.name,
                image: foodItem.image
            });
        }
        
        await cart.save();
        
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add item to cart"
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }
        
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        
        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }
        
        // Update the quantity
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart item"
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        
        // Remove the item from the cart
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();
        
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Remove cart item error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart"
        });
    }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        
        cart.items = [];
        await cart.save();
        
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to clear cart"
        });
    }
};

export { getUserCart, addToCart, updateCartItem, removeCartItem, clearCart }; 