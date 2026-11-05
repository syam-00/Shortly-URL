require("dotenv").config();

const connectDB = require("./src/config/database");

const express = require("express");


const app = express();


app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB();

const errorMiddleware = require("./src/middleware/error.middleware");

const testRoutes = require("./src/routes/test.routes");
const urlRoutes = require("./src/routes/url.routes");

const { redirectToOriginalUrl } = require("./src/controllers/url.controller");

app.get("/:shortCode", redirectToOriginalUrl);

app.use("/api",testRoutes);
app.use("/api/urls/",urlRoutes);

app.get("/",(req, res) => {
    res.send("URL Shortener Backend is running !!");
})


app.use(errorMiddleware);



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

