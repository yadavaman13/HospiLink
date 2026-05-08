const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const config = require("../config/config");

async function protect(req, res, next){
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

        if (!token) {
            return res.status(401).json({ 
                message: "Not authorized, no token" 
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "user not found" });
        }

        req.user = user;
        next();

    } catch (err) {
        res.status(401).json({ message: "Token invalid" });
    }
};

module.exports = {protect};