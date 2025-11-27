import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { authLimiter, validatePassword } from '../middleware/securityMiddleware.js';

const authRouter = express.Router();

// Apply rate limiting to auth routes
authRouter.post('/signup', authLimiter, validatePassword, registerUser);
authRouter.post('/signin', authLimiter, loginUser);

export default authRouter;