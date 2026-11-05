const mongoose = require("mongoose");
const Url = require("../models/url.model");
const generateShortCode = require("../utils/generateShortCode");


const createShortUrl = async (req, res) => {
    const { originalUrl, customCode, expiresAt } = req.body;

    if (!originalUrl) {
        return res.status(400).json({
            success: false,
            message: "Original URL is required"
        });
    }

    if (typeof originalUrl !== "string") {
        return res.status(400).json({
            success: false,
            message: "Original URL must be a string"
        });
    }


    if (customCode !== undefined) {
        if (typeof customCode !== "string") {
            return res.status(400).json({
                success: false,
                message: "Custom code must be a string"
            });
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
            return res.status(400).json({
                message: "Custom code can only contain letters, numbers, hyphens, and underscores"
            });
        }

        if (customCode.length < 3 || customCode.length > 30) {
            return res.status(400).json({
                message: "Custom code must be between 3 and 30 characters"
            });
        }
    }

    if (expiresAt !== undefined && expiresAt !== null) {
        const expirationDate = new Date(expiresAt);

        if (isNaN(expirationDate.getTime())) {
            return res.status(400).json({
                message: "Invalid expiration date"
            });
        }

        if (expirationDate <= new Date()) {
            return res.status(400).json({
                message: "Expiration date must be in the future"
            });
        }
    }

    try {
        const url = new URL(originalUrl);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return res.status(400).json({
                message: "Only HTTP and HTTPS URLs are allowed"
            });
        }

        const shortCode = customCode || generateShortCode();

        const existingUrl = await Url.findOne({
            shortCode: shortCode
        });

        if (existingUrl) { 
            return res.status(409).json({
                success: false,
                message: "Short code already exists. Please choose a different one."
            });
        }   

        const newUrl = await Url.create({
            originalUrl: url.toString(),
            shortCode: shortCode,
            customCode: customCode || null,
            expiresAt : expiresAt ? new Date(expiresAt) : null
        });

        res.status(201).json({
            success : true,
            message: "Short URL created successfully",
            data: {
                shortCode: newUrl.shortCode,
                shortUrl: `http://localhost:5000/${newUrl.shortCode}`,
                originalUrl: newUrl.originalUrl,
                customCode: newUrl.customCode,
                expiresAt: newUrl.expiresAt
            }
            
        });

    } catch (error) {
        console.error("Error creating short URL:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getUrlById = async (req, res) => {
    const { id } = req.params;

    if ( !mongoose.Types.ObjectId.isValid(id)) {
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
            success : true,
            data: url
            
        });
    }
    catch(error) {
        console.error("Error fetching URL :", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }


};

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



const getAllUrls = async (req, res) => {
    try {
        const pageParam = req.query.page;
        const limitParam = req.query.limit;

        const page = pageParam === undefined
            ? 1
            : Number(pageParam);

        const limit = limitParam === undefined
            ? 10
            : Number(limitParam);

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer"
            });
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be an integer between 1 and 100"
            });
        }

        const skip = (page - 1) * limit;

        const urls = await Url.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUrls = await Url.countDocuments();

        return res.status(200).json({
            success: true,
            data: urls,
            pagination: {
                currentPage: page,
                limit: limit,
                totalUrls: totalUrls,
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


const updateUrl = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL ID"
        });
    }

    const { originalUrl, customCode, expiresAt } = req.body;

    try {
        const url = await Url.findById(id);

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "URL not found"
            });
        }

        // Validate originalUrl if provided
        if (originalUrl !== undefined) {
            if (typeof originalUrl !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Original URL must be a string"
                });
            }

            try {
                const parsedUrl = new URL(originalUrl);

                if (
                    parsedUrl.protocol !== "http:" &&
                    parsedUrl.protocol !== "https:"
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Only HTTP and HTTPS URLs are allowed"
                    });
                }

                url.originalUrl = parsedUrl.toString();

            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid URL"
                });
            }
        }

        // Validate customCode if provided
        if (customCode !== undefined) {
            if (typeof customCode !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Custom code must be a string"
                });
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Custom code can only contain letters, numbers, hyphens, and underscores"
                });
            }

            if (customCode.length < 3 || customCode.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Custom code must be between 3 and 30 characters"
                });
            }

            if (customCode !== url.shortCode) {
                const existingUrl = await Url.findOne({
                    shortCode: customCode
                });

                if (existingUrl) {
                    return res.status(409).json({
                        success: false,
                        message: "Short code is already in use"
                    });
                }

                url.shortCode = customCode;
            }

            url.customCode = customCode;
        }

        // Validate expiresAt if provided
        if (expiresAt !== undefined) {
            if (expiresAt === null) {
                url.expiresAt = null;
            } else {
                const expirationDate = new Date(expiresAt);

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
                customCode: url.customCode,
                expiresAt: url.expiresAt,
                updatedAt: url.updatedAt
            }
        });

    } catch (error) {
        console.error("Error updating URL:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const deleteUrl  = async (req, res) => {
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
        return res.status(400).json({
            success: false,
            message: "URL not found"
        });
    }
    await Url.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "URL deleted successfully"
    });
}
catch (error) {
    console.error("Error deleting URL:", error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
};


const redirectToOriginalUrl = async (req, res) => {
    const { shortCode } = req.params;

    try {
        const url = await Url.findOne({
            shortCode: shortCode
        });

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        if (url.expiresAt && url.expiresAt < new Date()) {
            return res.status(410).json({
                success: false,
                message: "Short URL has expired"
            });
        }
        
        // url.clicks += 1;
        // await url.save();

        await Url.updateOne(
            { _id: url._id },
            { $inc: {clicks: 1}}
        );

        return res.redirect(url.originalUrl);

    } catch (error) {
        console.error("Error redirecting:", error);

        return res.status(500).json({
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