
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/database");
const errorMiddleware = require("./src/middleware/error.middleware");

const testRoutes = require("./src/routes/test.routes");
const urlRoutes = require("./src/routes/url.routes");
const { redirectToOriginalUrl } = require("./src/controllers/url.controller");

const app = express();

// 1. CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL?.replace(/\/$/, ""),
    "https://shortly1.vercel.app"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests without an Origin header (e.g. Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
}));

// 2. Parse JSON request bodies
app.use(express.json());

// 3. Port configuration
const PORT = process.env.PORT || 5000;

// 4. API routes
app.use("/api", testRoutes);
app.use("/api/urls", urlRoutes);

// 5. Backend health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Shortly URL Shortener Backend is running!",
        database: "Connected"
    });
});

// 6. Short URL redirection
app.get("/:shortCode", redirectToOriginalUrl);

// 7. Error handling middleware
app.use(errorMiddleware);

// 8. Start server only after MongoDB connects
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Shortly backend running on port ${PORT}`);
            console.log("MongoDB connected successfully");
        });
    } catch (error) {
        console.error("Backend startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
