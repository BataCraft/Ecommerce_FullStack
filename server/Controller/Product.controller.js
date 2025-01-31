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

        const {
            name,
            categoryId,
            brand,
            description,
            regular,
            sale,
            quantity = "0",
            specifications,
            features,
            isNew,
            isFeatured,
            isWeeklyDeal
        } = requestData;

        // Validate required fields
        if (!name || !categoryId || !brand || !description || !regular || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
                required: {
                    name: !name,
                    categoryId: !categoryId,
                    brand: !brand,
                    description: !description,
                    regular: !regular,
                    quantity: !quantity
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
        if (req.files && req.files.length > 0) {
            try {
                // Upload each image to Cloudinary
                const uploadPromises = req.files.map(async (file) => {
                    const result = await uploadImage(file.path);
                    // Delete temporary file
                    await fs.unlink(file.path);
                    return result;
                });

                uploadedImages = await Promise.all(uploadPromises);
                console.log("Uploaded images:", uploadedImages);
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                // Clean up any temporary files
                await Promise.all(req.files.map(file => fs.unlink(file.path).catch(console.error)));
                throw new Error("Failed to upload images");
            }
        }

        // Create product data
        const productData = {
            name: name.trim(),
            images: uploadedImages, // Add uploaded image URLs
            category: categoryId,
            brand: brand.trim(),
            price: {
                regular: parseFloat(regular),
                sale: sale ? parseFloat(sale) : null,
                discount_percentage: sale ? 
                    Math.round(((parseFloat(regular) - parseFloat(sale)) / parseFloat(regular)) * 100) : 0
            },
            stock: {
                quantity: parseInt(quantity),
                status: parseInt(quantity) === 0 ? 'out_of_stock' : 
                        parseInt(quantity) < 10 ? 'low_stock' : 'in_stock'
            },
            specifications: parseJsonOrDefault(specifications),
            features: parseArrayOrDefault(features),
            description: description.trim(),
            flags: {
                isNew: isNew === 'true' || isNew === true,
                isFeatured: isFeatured === 'true' || isFeatured === true,
                isWeeklyDeal: isWeeklyDeal === 'true' || isWeeklyDeal === true
            },
            createdBy: "BataCraft",
            createdAt: "2025-01-31 07:01:26"
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
            await Promise.all(req.files.map(file => 
                fs.unlink(file.path).catch(console.error)
            ));
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
        // console.log("Update Files:", req.files);
        // console.log("Update Data:", requestData);

        // Find existing product
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            if (req.files) {
                await Promise.all(req.files.map(file => fs.unlink(file.path)));
            }
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Handle image uploads if new images are provided
        let uploadedImages = existingProduct.images || []; // Keep existing images
        if (req.files && req.files.length > 0) {
            try {
                // Upload new images
                const uploadPromises = req.files.map(async (file) => {
                    const result = await uploadImage(file.path);
                    await fs.unlink(file.path); // Clean up temp file
                    return result;
                });

                const newImages = await Promise.all(uploadPromises);
                uploadedImages = [...uploadedImages, ...newImages];
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                if (req.files) {
                    await Promise.all(req.files.map(file => 
                        fs.unlink(file.path).catch(err => console.error('Cleanup error:', err))
                    ));
                }
                throw new Error("Failed to upload new images");
            }
        }

        // Prepare update data
        const updateData = {
            name: requestData.name?.trim(),
            brand: requestData.brand?.trim(),
            images: uploadedImages,
            description: requestData.description?.trim(),
            price: {
                ...existingProduct.price,
                regular: requestData.regular ? parseFloat(requestData.regular) : existingProduct.price.regular,
                sale: requestData.sale ? parseFloat(requestData.sale) : existingProduct.price.sale
            },
            stock: {
                quantity: requestData.quantity ? parseInt(requestData.quantity) : existingProduct.stock.quantity,
                status: requestData.quantity ? 
                    (parseInt(requestData.quantity) === 0 ? 'out_of_stock' : 
                     parseInt(requestData.quantity) < 10 ? 'low_stock' : 'in_stock') :
                    existingProduct.stock.status
            },
            specifications: requestData.specifications ? 
                JSON.parse(requestData.specifications) : 
                existingProduct.specifications,
            features: requestData.features ? 
                (typeof requestData.features === 'string' ? 
                    requestData.features.split(',').map(f => f.trim()) : 
                    requestData.features) : 
                existingProduct.features,
            flags: {
                isNew: requestData.isNew === 'true' || requestData.isNew === true,
                isFeatured: requestData.isFeatured === 'true' || requestData.isFeatured === true,
                isWeeklyDeal: requestData.isWeeklyDeal === 'true' || requestData.isWeeklyDeal === true
            },
            updatedBy: "BataCraft",
            updatedAt: "2025-01-31 07:18:11"
        };

        // Calculate discount percentage if both regular and sale prices are provided
        if (updateData.price.regular && updateData.price.sale) {
            updateData.price.discount_percentage = Math.round(
                ((updateData.price.regular - updateData.price.sale) / updateData.price.regular) * 100
            );
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
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




