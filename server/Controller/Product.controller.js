const Product = require("../Model/Product.model");

const Category = require('../Model/Category.model');
// const fs = require ('fs')
const {uploadImage} = require('../Utils/Cloudinary')
const fs = require('fs').promises;
const createProduct = async (req, res) => {
    try {
        const requestData = req.body;
        console.log("Files received:", req.files); // Debug log
        console.log("Request data:", requestData); // Debug log

        // Parse JSON strings from request body
        const price = parseJsonOrDefault(requestData.price);
        const stock = parseJsonOrDefault(requestData.stock);
        const flags = parseJsonOrDefault(requestData.flags);

        const {
            name,
            categoryId,
            brand,
            description
        } = requestData;

        // Validate required fields
        if (!name || !categoryId || !brand || !description || !price.regular || !stock.quantity) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
                required: {
                    name: !name,
                    categoryId: !categoryId,
                    brand: !brand,
                    description: !description,
                    regular: !price.regular,
                    quantity: !stock.quantity
                }
            });
        }

        // Check if category exists
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category not found"
            });
        }

        // Upload images to Cloudinary
        let uploadedImages = [];
        let thumbnailUrl = '';

        // Handle thumbnail
        if (req.files.thumbnail && req.files.thumbnail[0]) {
            try {
                thumbnailUrl = await uploadImage(req.files.thumbnail[0].path);
                await fs.unlink(req.files.thumbnail[0].path);
            } catch (error) {
                console.error("Thumbnail upload error:", error);
                throw new Error("Failed to upload thumbnail");
            }
        }

        // Handle product images
        if (req.files.images && req.files.images.length > 0) {
            try {
                const uploadPromises = req.files.images.map(async (file) => {
                    const result = await uploadImage(file.path);
                    await fs.unlink(file.path);
                    return result;
                });

                uploadedImages = await Promise.all(uploadPromises);
            } catch (error) {
                console.error("Image upload error:", error);
                throw new Error("Failed to upload images");
            }
        }

        // Create product data with current timestamp and user
        const productData = {
            name: name.trim(),
            thumbnail: thumbnailUrl,
            images: uploadedImages,
            category: categoryId,
            brand: brand.trim(),
            price: {
                regular: parseFloat(price.regular),
                sale: price.sale ? parseFloat(price.sale) : null,
                discount_percentage: price.sale ? 
                    Math.round(((parseFloat(price.regular) - parseFloat(price.sale)) / parseFloat(price.regular)) * 100) : 0
            },
            stock: {
                quantity: parseInt(stock.quantity),
                status: parseInt(stock.quantity) === 0 ? 'out_of_stock' : 
                        parseInt(stock.quantity) < 10 ? 'low_stock' : 'in_stock'
            },
            specifications: parseJsonOrDefault(requestData.specifications),
            features: parseArrayOrDefault(requestData.features),
            description: description.trim(),
            flags: {
                isNew: flags.isNew === true,
                isFeatured: flags.isFeatured === true,
                isWeeklyDeal: flags.isWeeklyDeal === true
            },
            createdBy: "BataCraft", // Current user
            createdAt: "2025-02-10 06:14:52" // Current UTC timestamp
        };

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        // Clean up temporary files if they exist
        if (req.files) {
            if (req.files.thumbnail) {
                await Promise.all(req.files.thumbnail.map(file => 
                    fs.unlink(file.path).catch(console.error)
                ));
            }
            if (req.files.images) {
                await Promise.all(req.files.images.map(file => 
                    fs.unlink(file.path).catch(console.error)
                ));
            }
        }

        console.error("Create Product Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const requestData = req.body;
        console.log("Update Files:", req.files);
        console.log("Update Data:", requestData);

        // Find existing product
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            // Clean up any uploaded files
            if (req.files) {
                if (req.files.thumbnail) {
                    await Promise.all(req.files.thumbnail.map(file => fs.unlink(file.path)));
                }
                if (req.files.images) {
                    await Promise.all(req.files.images.map(file => fs.unlink(file.path)));
                }
            }
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Parse JSON strings from request body
        const price = parseJsonOrDefault(requestData.price, existingProduct.price);
        const stock = parseJsonOrDefault(requestData.stock, existingProduct.stock);
        const flags = parseJsonOrDefault(requestData.flags, existingProduct.flags);
        const specifications = parseJsonOrDefault(requestData.specifications, existingProduct.specifications);

        // Handle thumbnail upload if new thumbnail is provided
        let thumbnailUrl = existingProduct.thumbnail;
        if (req.files?.thumbnail && req.files.thumbnail[0]) {
            try {
                thumbnailUrl = await uploadImage(req.files.thumbnail[0].path);
                await fs.unlink(req.files.thumbnail[0].path);
            } catch (uploadError) {
                console.error("Thumbnail upload error:", uploadError);
                throw new Error("Failed to upload thumbnail");
            }
        }

        // Handle image uploads if new images are provided
        let uploadedImages = existingProduct.images || [];
        if (req.files?.images && req.files.images.length > 0) {
            try {
                const uploadPromises = req.files.images.map(async (file) => {
                    const result = await uploadImage(file.path);
                    await fs.unlink(file.path);
                    return result;
                });

                const newImages = await Promise.all(uploadPromises);
                uploadedImages = [...uploadedImages, ...newImages];
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                throw new Error("Failed to upload images");
            }
        }

        // Prepare update data
        const updateData = {
            name: requestData.name?.trim() || existingProduct.name,
            thumbnail: thumbnailUrl,
            images: uploadedImages,
            brand: requestData.brand?.trim() || existingProduct.brand,
            description: requestData.description?.trim() || existingProduct.description,
            price: {
                regular: price.regular ? parseFloat(price.regular) : existingProduct.price.regular,
                sale: price.sale ? parseFloat(price.sale) : existingProduct.price.sale,
                discount_percentage: price.regular && price.sale ? 
                    Math.round(((parseFloat(price.regular) - parseFloat(price.sale)) / parseFloat(price.regular)) * 100) : 
                    existingProduct.price.discount_percentage
            },
            stock: {
                quantity: stock.quantity ? parseInt(stock.quantity) : existingProduct.stock.quantity,
                status: stock.quantity ? 
                    (parseInt(stock.quantity) === 0 ? 'out_of_stock' : 
                     parseInt(stock.quantity) < 10 ? 'low_stock' : 'in_stock') :
                    existingProduct.stock.status
            },
            specifications: specifications,
            features: parseArrayOrDefault(requestData.features, existingProduct.features),
            flags: {
                isNew: flags.isNew ?? existingProduct.flags.isNew,
                isFeatured: flags.isFeatured ?? existingProduct.flags.isFeatured,
                isWeeklyDeal: flags.isWeeklyDeal ?? existingProduct.flags.isWeeklyDeal
            },
            updatedBy: "BataCraft", // Current user
            updatedAt: "2025-02-10 06:16:56" // Current UTC timestamp
        };

        // If category is being updated, verify it exists
        if (requestData.categoryId) {
            const existingCategory = await Category.findById(requestData.categoryId);
            if (!existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category not found"
                });
            }
            updateData.category = requestData.categoryId;
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('category', 'name');

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        // Clean up any temporary files
        if (req.files) {
            if (req.files.thumbnail) {
                await Promise.all(req.files.thumbnail.map(file => 
                    fs.unlink(file.path).catch(err => console.error('Cleanup error:', err))
                ));
            }
            if (req.files.images) {
                await Promise.all(req.files.images.map(file => 
                    fs.unlink(file.path).catch(err => console.error('Cleanup error:', err))
                ));
            }
        }

        console.error("Update Product Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Product
const DeleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Find product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            try {
                const deletePromises = product.images.map(async (imageUrl) => {
                    // Extract public_id from Cloudinary URL
                    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
                    return cloudinary.uploader.destroy(`products/${publicId}`);
                });

                await Promise.all(deletePromises);
                console.log("Deleted images from Cloudinary");
            } catch (cloudinaryError) {
                console.error("Cloudinary deletion error:", cloudinaryError);
                // Continue with product deletion even if image deletion fails
            }
        }

        // Delete product from database
        await Product.findByIdAndDelete(id);

        // Add deletion audit
   

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Products
const GetAllProduct = async(req, res) => {
    try {
        const { 
            page = 1, 
            name,
            limit = 10,
            sort = '-createdAt',
            category,
            brand,
            priceMin,
            priceMax,
            inStock 
        } = req.query;

        // Build query
        const query = {};
        if (category) query.category = category;
        if (brand) query.brand = brand;
        if (priceMin || priceMax) {
            query['price.regular'] = {};
            if (priceMin) query['price.regular'].$gte = parseFloat(priceMin);
            if (priceMax) query['price.regular'].$lte = parseFloat(priceMax);
        }
        if (inStock === 'true') query['stock.status'] = 'in_stock';

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Product by ID
const GetProductById = async(req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper functions
function parseJsonOrDefault(value, defaultValue = {}) {
    if (!value) return defaultValue;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('JSON parsing error:', error);
        return defaultValue;
    }
}

function parseArrayOrDefault(value, defaultValue = []) {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : value.split(',').map(item => item.trim());
        } catch (error) {
            return value.split(',').map(item => item.trim());
        }
    }
    return defaultValue;
}

module.exports = { createProduct, updateProduct, DeleteProduct, GetAllProduct, GetProductById };




