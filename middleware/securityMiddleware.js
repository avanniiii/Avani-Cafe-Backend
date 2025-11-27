import rateLimit from 'express-rate-limit';
import PasswordValidator from 'password-validator';

// Create rate limiter
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth routes
    message: 'Too many login attempts, please try again after 15 minutes'
});

// Create password schema
const passwordSchema = new PasswordValidator();
passwordSchema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(1)
    .has().not().spaces();

export const validatePassword = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers'
        });
    }
    next();
};