import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { validateEmail, validateName, sanitizeUser } from "../utils/validation.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!validateName(name)) {
            return res.status(400).json({
                success: false,
                message: "Name should be between 2 and 50 characters"
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Validate role if provided
        const validRoles = ['buyer', 'seller'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role provided"
            });
        }

        // Check if user already exists
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        // Create user with role
        const user = await userModel.create({
            name,
            email,
            password,
            role: role || 'buyer'  // Default to buyer if not specified
        });

        if (user) {
            const sanitizedUser = sanitizeUser(user);
            res.status(201).json({
                success: true,
                data: {
                    ...sanitizedUser,
                    token: generateToken(user._id),
                }
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred during registration. Please try again."
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/signin
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email });

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            const sanitizedUser = sanitizeUser(user);
            res.json({
                success: true,
                data: {
                    ...sanitizedUser,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred during login. Please try again."
        });
    }
};

// Get current user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (user) {
            const sanitizedUser = sanitizeUser(user);
            res.json({
                success: true,
                data: sanitizedUser
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving user profile"
        });
    }
};

export { registerUser, loginUser, getUserProfile };