const User = require("../models/user.model");

// GET ALL USERS (hospital based)
async function getAllUsers(req, res){
    try {
        const users = await User.find({ hospitalId: req.user.hospitalId });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET SINGLE USER
async function getUser(req, res){
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE USER
async function updateUser(req, res){
    try {
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {getAllUsers, getUser, updateUser};