const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error("File path not provided");
        }

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "products",
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            resource_type: "auto"
        });

        console.log("✅ Uploaded Image:", result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error);
        throw error;
    }
};

module.exports = { uploadImage };