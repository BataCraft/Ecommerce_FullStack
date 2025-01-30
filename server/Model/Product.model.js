const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']

    },
    slug: {
        type: String,
        required: [true, 'Product slug is required'],
        unique: true

    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],

    brand: {
        type: String,
        required: true

    },

    price: {
        regular: {
            type: Number,
            required: true,
            maxLength: [5, 'Product price cannot exceed 5 characters'],
        },
        sale: {
            type: Number,
        },
        discount_percentage: {
            type: Number,
            default: 0
        }
    },

    stock: {
        quantity: {
            type: Number,
            required: [true, "Please enter product stock"],
            maxLength: [4, "Stock cannot exceed 4 characters"],
            default: 0
        },
        status: {
            type: String,
            enum: ['in_stock', 'out_of_stock', 'low_stock'],
            default: 'in_stock'
        }
    },

    specifications: {
        dimensions: String,
        weight: String,
        bluetooth_version: String,
        battery_life: String,
        waterproof_rating: String
    },

    features: [String],

    description: {
        type: String,
        required: [true, "Please enter product description"]
    },

    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    flags: {
        isNew: {
            type: Boolean,
            default: true
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        isWeeklyDeal: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });


module.exports = mongoose.model('Product', productSchema);