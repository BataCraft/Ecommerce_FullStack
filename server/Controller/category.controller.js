const Category = require("../Model/Category.model");

const CreateCategory = async(req, res) => {
    try {
        const { name } = req.body;
        
        if(!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        // Add await here for findOne operation
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive search
        });

        if(existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        // Create new category
        const category = new Category({
            name: name.trim(), // Remove any extra spaces
        });

        await category.save();
        
        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });
        
    } catch (error) {
        console.error("Create Category Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @description Update a category by id
 * @param {string} id - Category id
 * @param {string} name - New category name
 * @returns {object} Updated category
 * @throws {Error} If category not found or duplicate name
 */
const updateCategory = async(req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: id } // Exclude current category
        });

        if(existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const category = await Category.findByIdAndUpdate({_id : id});

        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        };

        category.name = name

        const updatedCategory = await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            updatedCategory
        })

    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            message: error.message
        })
        
    }
};


/**
 * @description Delete a category by its id
 * @route DELETE /api/category/:id
 * @param {string} id Category id
 * @returns {object} Success message and the deleted category
 * @throws {Error} If category not found
 */
const deleteCategory = async(req, res) => {
    try {
        const Deleted = await Category.findByIdAndDelete(req.params.id);

        if(!Deleted) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
        
    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: error.message
        })  
        
    }
}

/**
 * @description Fetch all categories
 * @route GET /api/category
 * @returns {object} Success message and array of categories
 * @throws {Error} If categories cannot be fetched
 */
const GetAllCategory = async(req, res) => {
    try {
        const categories = await Category.find({});
        if(!categories) {
            return res.status(404).json({
                success: false,
                message: "Categories not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


/**
 * @description Fetch a category by its id
 * @route GET /api/category/:id
 * @param {string} id Category id
 * @returns {object} Success message and the category
 * @throws {Error} If category not found
 */
const ReadCategory = async(req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        };
        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            category
        });
    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: error.message
        });
        
    }
}
module.exports = { CreateCategory , updateCategory, deleteCategory, GetAllCategory, ReadCategory };