import foodModel from "../models/foodModel.js";
import asyncHandler from "express-async-handler";
import fs from "fs";

//add food item

const addFood = async (req, res) => {

    let image_filename = '${req.file.filename}';

    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: image_filename,
        category: req.body.category,
        image:image_filename
    });
    try {
        await food.save();
        res.json({success:true, message:"Food item added successfully"});
    }catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:"Failed to add food item"});
    }

}

const getAllFood = async (req, res) => {
    try {
        const food = await foodModel.find();
        res.json({
            success: true,
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching food items',
            error: error.message
        });
    }
};

const getFoodById = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }
        res.json({
            success: true,
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching food item',
            error: error.message
        });
    }
};

const getFoodByCategory = async (req, res) => {
    try {
        const food = await foodModel.find({ category: req.params.category });
        res.json({
            success: true,
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching food items by category',
            error: error.message
        });
    }
};

const createFood = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        let imageUrl = req.body.image; // Default to provided image URL

        // If file was uploaded, use the file path
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const food = await foodModel.create({
            name,
            description,
            price,
            category,
            image: imageUrl
        });

        res.status(201).json({
            success: true,
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating food item',
            error: error.message
        });
    }
};

const updateFood = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        let updateData = { name, description, price, category };

        // If file was uploaded, update image
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        const food = await foodModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        res.json({
            success: true,
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating food item',
            error: error.message
        });
    }
};

const deleteFood = async (req, res) => {
    try {
        const food = await foodModel.findByIdAndDelete(req.params.id);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }
        res.json({
            success: true,
            message: 'Food item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting food item',
            error: error.message
        });
    }
};

export {
    addFood,
    getAllFood,
    getFoodById,
    getFoodByCategory,
    createFood,
    updateFood,
    deleteFood
};