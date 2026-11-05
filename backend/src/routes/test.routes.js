const express = require("express");

const router = express.Router();

router.get("/test", (re, res) => {
    res.status(200).json({
        message: "API is working !!"
    });
});

module.exports = router;