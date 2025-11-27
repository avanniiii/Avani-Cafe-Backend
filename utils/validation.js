export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateName = (name) => {
    return name && name.length >= 2 && name.length <= 50;
};

export const sanitizeUser = (user) => {
    const { password, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
};