require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/database");
const errorMiddleware = require("./src/middleware/error.middleware");

const testRoutes = require("./src/routes/test.routes");
const urlRoutes = require("./src/routes/url.routes");
const { redirectToOriginalUrl } = require("./src/controllers/url.controller");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB();

app.use("/api", testRoutes);
app.use("/api/urls", urlRoutes);

app.get("/", (req, res) => {
    res.send("URL Shortener Backend is running!");
});

app.get("/:shortCode", redirectToOriginalUrl);

app.use(errorMiddleware);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});