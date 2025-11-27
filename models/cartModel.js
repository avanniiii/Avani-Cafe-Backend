import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Food',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { _id: true });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // Remove unique constraint to allow updating the cart in case of error
        // unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    totalItems: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save hook to calculate totalAmount and totalItems
cartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart; 