const express = require("express");

const router = express.Router();

const {
    createShortUrl,
    getUrlById,
    getUrlAnalytics,
    getAllUrls,
    updateUrl,
    deleteUrl
} = require("../controllers/url.controller");

router.post("/", createShortUrl);
router.get("/", getAllUrls);
router.get("/:id", getUrlById);
router.get("/:id/analytics", getUrlAnalytics);
router.put("/:id", updateUrl);
router.delete("/:id",deleteUrl);


module.exports = router;