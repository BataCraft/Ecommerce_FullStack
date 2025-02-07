const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require("cookie-parser");
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Import database connection
const connectDb = require('./config/Db');

// Initialize express
const app = express();

// Create temp directory
const tempDir = path.join(__dirname, 'Public', 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "http://192.168.0.4:3000"],
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'Public')));

// Routes
app.use("/api/auth", require("./Routes/auth.routes"));
app.use("/api/category", require("./Routes/category.routes"));
app.use("/api/product", require("./Routes/Product.routes"));

// Connect to database
connectDb();

// Start server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    if (server) {
        server.close(() => {
            console.log('Server closed due to unhandled rejection');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});