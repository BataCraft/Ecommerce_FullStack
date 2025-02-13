const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Ensure temp directory exists
const ensureTempDir = async () => {
    const tempDir = './Public/temp';
    try {
        await fs.access(tempDir);
    } catch {
        await fs.mkdir(tempDir, { recursive: true });
    }
};

// Configure storage
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        await ensureTempDir();
        cb(null, './Public/temp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
        error.code = 'INVALID_FILE_TYPE';
        return cb(error, false);
    }
    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 6 // Increased to 6 to accommodate 1 thumbnail + 5 images
    }
});

module.exports = upload;