
const mongoose = require("mongoose");
const Url = require("../models/url.model");
const generateShortCode = require("../utils/generateShortCode");

// Generate the public short URL
const getShortUrl = (shortCode) => {
    const backendUrl = (
        process.env.BACKEND_URL ||
        "http://localhost:5000"
    ).replace(/\/+$/, "");

    return `${backendUrl}/${shortCode}`;
};

// CREATE SHORT URL
const createShortUrl = async (req, res) => {
    try {
        let { originalUrl, customCode, expiresAt } = req.body;

        // Validate original URL
        if (!originalUrl || typeof originalUrl !== "string") {
            return res.status(400).json({
                success: false,
                message: "Original URL is required"
            });
        }

        originalUrl = originalUrl.trim();

        let parsedUrl;

        try {
            parsedUrl = new URL(originalUrl);

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Invalid protocol");
            }
        } catch {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid HTTP or HTTPS URL"
            });
        }

        // Validate custom alias
        customCode =
            typeof customCode === "string"
                ? customCode.trim()
                : customCode;

        if (customCode === "") {
            customCode = null;
        }

        if (customCode !== undefined && customCode !== null) {
            if (typeof customCode !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Custom code must be a string"
                });
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
                return res.status(400).json({
                    success: false,
                    message: "Custom code can only contain letters, numbers, hyphens, and underscores"
                });
            }

            if (customCode.length < 3 || customCode.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Custom code must be between 3 and 30 characters"
                });
            }
        }

        // Validate expiration date
        let expirationDate = null;

        if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
            expirationDate = new Date(expiresAt);

            if (isNaN(expirationDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid expiration date"
                });
            }

            if (expirationDate <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Expiration date must be in the future"
                });
            }
        }

        // Generate short code
        const shortCode = customCode || generateShortCode();

        // Check duplicate short code
        const existingUrl = await Url.findOne({ shortCode });

        if (existingUrl) {
            return res.status(409).json({
                success: false,
                message: "Short code already exists. Please choose another."
            });
        }

        // Save URL
        const newUrl = await Url.create({
            originalUrl: parsedUrl.toString(),
            shortCode,
            customCode: customCode || null,
            expiresAt: expirationDate
        });

        return res.status(201).json({
            success: true,
            message: "Short URL created successfully",
            data: {
                id: newUrl._id,
                shortCode: newUrl.shortCode,
                shortUrl: getShortUrl(newUrl.shortCode),
                originalUrl: newUrl.originalUrl,
                customCode: newUrl.customCode,
                expiresAt: newUrl.expiresAt,
                clicks: newUrl.clicks,
                createdAt: newUrl.createdAt
            }
        });

    } catch (error) {
        console.error("Error creating short URL:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This short code already exists. Please try again."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};


// GET URL BY ID
const getUrlById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL ID"
        });
    }

    try {
        const url = await Url.findById(id);

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "URL not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                ...url.toObject(),
                shortUrl: getShortUrl(url.shortCode)
            }
        });

    } catch (error) {
        console.error("Error fetching URL:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET URL ANALYTICS
const getUrlAnalytics = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL ID"
        });
    }

    try {
        const url = await Url.findById(id).select(
            "originalUrl shortCode customCode clicks expiresAt createdAt updatedAt"
        );

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "URL not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                shortCode: url.shortCode,
                shortUrl: getShortUrl(url.shortCode),
                originalUrl: url.originalUrl,
                customCode: url.customCode,
                clicks: url.clicks,
                expiresAt: url.expiresAt,
                createdAt: url.createdAt,
                updatedAt: url.updatedAt
            }
        });

    } catch (error) {
        console.error("Error fetching URL analytics:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET ALL URLS
const getAllUrls = async (req, res) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer"
            });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100"
            });
        }

        const skip = (page - 1) * limit;

        const [urls, totalUrls] = await Promise.all([
            Url.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Url.countDocuments()
        ]);

        const formattedUrls = urls.map((url) => ({
            ...url,
            shortUrl: getShortUrl(url.shortCode)
        }));

        return res.status(200).json({
            success: true,
            data: formattedUrls,
            pagination: {
                currentPage: page,
                limit,
                totalUrls,
                totalPages: Math.ceil(totalUrls / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching URLs:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// UPDATE URL
const updateUrl = async (req, res) => {
    const { id } = req.params;
    const { originalUrl, customCode, expiresAt } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL ID"
        });
    }

    try {
        const url = await Url.findById(id);

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "URL not found"
            });
        }

        // Update original URL
        if (originalUrl !== undefined) {
            if (typeof originalUrl !== "string" || !originalUrl.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Original URL must be a valid string"
                });
            }

            let parsedUrl;

            try {
                parsedUrl = new URL(originalUrl.trim());

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new Error("Invalid protocol");
                }
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid HTTP or HTTPS URL"
                });
            }

            url.originalUrl = parsedUrl.toString();
        }

        // Update custom alias
        if (customCode !== undefined) {
            const code = typeof customCode === "string"
                ? customCode.trim()
                : customCode;

            if (code === "") {
                return res.status(400).json({
                    success: false,
                    message: "Custom code cannot be empty. Use a valid alias."
                });
            }

            if (typeof code !== "string" ||
                !/^[a-zA-Z0-9_-]{3,30}$/.test(code)) {
                return res.status(400).json({
                    success: false,
                    message: "Custom code must contain 3-30 letters, numbers, hyphens, or underscores"
                });
            }

            if (code !== url.shortCode) {
                const existingUrl = await Url.findOne({
                    shortCode: code
                });

                if (existingUrl) {
                    return res.status(409).json({
                        success: false,
                        message: "Short code is already in use"
                    });
                }

                url.shortCode = code;
            }

            url.customCode = code;
        }

        // Update expiration date
        if (expiresAt !== undefined) {
            if (expiresAt === null || expiresAt === "") {
                url.expiresAt = null;
            } else {
                const expirationDate = new Date(expiresAt);

                if (isNaN(expirationDate.getTime()) ||
                    expirationDate <= new Date()) {
                    return res.status(400).json({
                        success: false,
                        message: "Expiration date must be a valid future date"
                    });
                }

                url.expiresAt = expirationDate;
            }
        }

        await url.save();

        return res.status(200).json({
            success: true,
            message: "URL updated successfully",
            data: {
                id: url._id,
                originalUrl: url.originalUrl,
                shortCode: url.shortCode,
                shortUrl: getShortUrl(url.shortCode),
                customCode: url.customCode,
                expiresAt: url.expiresAt,
                updatedAt: url.updatedAt
            }
        });

    } catch (error) {
        console.error("Error updating URL:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Short code is already in use"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// DELETE URL
const deleteUrl = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL ID"
        });
    }

    try {
        const url = await Url.findByIdAndDelete(id);

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "URL not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "URL deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting URL:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// REDIRECT TO ORIGINAL URL
const redirectToOriginalUrl = async (req, res) => {
    const { shortCode } = req.params;

    try {
        const url = await Url.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        if (url.expiresAt && url.expiresAt <= new Date()) {
            return res.status(410).json({
                success: false,
                message: "Short URL has expired"
            });
        }

        // Increment click count
        await Url.updateOne(
            { _id: url._id },
            { $inc: { clicks: 1 } }
        );

        return res.redirect(302, url.originalUrl);

    } catch (error) {
        console.error("Error redirecting:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    createShortUrl,
    getUrlById,
    getUrlAnalytics,
    getAllUrls,
    updateUrl,
    deleteUrl,
    redirectToOriginalUrl
};
