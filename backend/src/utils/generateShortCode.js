const crypto = require("crypto");

const generateShortCode = (length = 6) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result ="";

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        result += characters[randomIndex];
    }

    return result;
};

module.exports = generateShortCode;